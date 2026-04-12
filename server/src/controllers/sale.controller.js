const prisma = require("../lib/prisma");
const { generateHtmlReceipt } = require("../services/receipt.service");

async function list(req, res, next) {
  try {
    const { from, to, branchId } = req.query;
    const sales = await prisma.sale.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(from && to && { createdAt: { gte: new Date(from), lte: new Date(to) } }),
      },
      include: { items: { include: { product: true } }, user: { select: { name: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(sales);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, user: true, customer: true, branch: true },
    });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { items, customerId, paymentMethod, amountPaid, discount = 0, tax = 0, branchId } = req.body;

    // Calculate totals
    let subtotal = 0;
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    const saleItems = items.map((item) => {
      const product = productMap[item.productId];
      const subtotalItem = product.price * item.quantity;
      subtotal += subtotalItem;
      return { productId: item.productId, quantity: item.quantity, unitPrice: product.price, subtotal: subtotalItem };
    });

    const total = subtotal - discount + tax;
    const change = amountPaid - total;

    const sale = await prisma.$transaction(async (tx) => {
      // Deduct inventory
      for (const item of items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId, branchId: branchId ?? req.user.branchId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Award loyalty points
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { increment: Math.floor(total / 100) } },
        });
      }

      return tx.sale.create({
        data: {
          userId: req.user.id,
          branchId: branchId ?? req.user.branchId,
          customerId,
          paymentMethod,
          amountPaid,
          discount,
          tax,
          total,
          change,
          items: { create: saleItems },
        },
        include: { items: true },
      });
    });

    res.status(201).json(sale);
  } catch (err) { next(err); }
}

async function refund(req, res, next) {
  try {
    const sale = await prisma.sale.update({
      where: { id: req.params.id },
      data: { status: "REFUNDED" },
    });
    res.json(sale);
  } catch (err) { next(err); }
}

async function receipt(req, res, next) {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, user: true, customer: true },
    });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    const html = generateHtmlReceipt(sale);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (err) { next(err); }
}

module.exports = { list, get, create, refund, receipt };
