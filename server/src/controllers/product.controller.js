const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const { search, categoryId } = req.query;
    const products = await prisma.product.findMany({
      where: {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true, inventory: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true, inventory: true },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, sku, price, costPrice, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, sku, price, costPrice, categoryId },
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(product);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove };
