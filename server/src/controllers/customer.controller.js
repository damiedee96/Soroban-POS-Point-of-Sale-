const prisma = require("../lib/prisma");

async function list(req, res, next) {
  try {
    const { search } = req.query;
    const customers = await prisma.customer.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] }
        : undefined,
      orderBy: { name: "asc" },
    });
    res.json(customers);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { sales: { orderBy: { createdAt: "desc" }, take: 10 } },
    });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    res.status(201).json(customer);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: req.body });
    res.json(customer);
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update };
