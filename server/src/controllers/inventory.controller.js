const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const items = await prisma.inventory.findMany({
      include: { product: true, branch: true },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function lowStock(req, res, next) {
  try {
    const items = await prisma.inventory.findMany({
      where: { quantity: { lte: prisma.inventory.fields.lowStock } },
      include: { product: true, branch: true },
    });
    // Fallback: manual filter
    const all = await prisma.inventory.findMany({ include: { product: true, branch: true } });
    const low = all.filter((i) => i.quantity <= i.lowStock);
    res.json(low);
  } catch (err) { next(err); }
}

async function adjust(req, res, next) {
  try {
    const { productId, branchId } = req.params;
    const { quantity, lowStock } = req.body;
    const item = await prisma.inventory.upsert({
      where: { productId_branchId: { productId, branchId } },
      update: { quantity, ...(lowStock !== undefined && { lowStock }) },
      create: { productId, branchId, quantity, lowStock: lowStock ?? 5 },
    });
    res.json(item);
  } catch (err) { next(err); }
}

module.exports = { list, lowStock, adjust };
