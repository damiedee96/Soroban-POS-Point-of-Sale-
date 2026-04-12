const prisma = require("../lib/prisma");

async function summary(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSales, todaySales, totalCustomers, totalProducts] = await Promise.all([
      prisma.sale.aggregate({ _sum: { total: true }, _count: true, where: { status: "COMPLETED" } }),
      prisma.sale.aggregate({ _sum: { total: true }, _count: true, where: { status: "COMPLETED", createdAt: { gte: today } } }),
      prisma.customer.count(),
      prisma.product.count(),
    ]);

    res.json({
      totalRevenue: totalSales._sum.total || 0,
      totalTransactions: totalSales._count,
      todayRevenue: todaySales._sum.total || 0,
      todayTransactions: todaySales._count,
      totalCustomers,
      totalProducts,
    });
  } catch (err) { next(err); }
}

async function salesByPeriod(req, res, next) {
  try {
    const { from, to } = req.query;
    const sales = await prisma.sale.findMany({
      where: {
        status: "COMPLETED",
        createdAt: { gte: new Date(from), lte: new Date(to) },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(sales);
  } catch (err) { next(err); }
}

async function topProducts(req, res, next) {
  try {
    const items = await prisma.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 10,
    });
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const result = items.map((i) => ({ ...i, product: productMap[i.productId] }));
    res.json(result);
  } catch (err) { next(err); }
}

async function staffPerformance(req, res, next) {
  try {
    const data = await prisma.sale.groupBy({
      by: ["userId"],
      _sum: { total: true },
      _count: true,
      where: { status: "COMPLETED" },
      orderBy: { _sum: { total: "desc" } },
    });
    const userIds = data.map((d) => d.userId);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    res.json(data.map((d) => ({ ...d, user: userMap[d.userId] })));
  } catch (err) { next(err); }
}

module.exports = { summary, salesByPeriod, topProducts, staffPerformance };
