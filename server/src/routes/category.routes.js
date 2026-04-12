const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try { res.json(await prisma.category.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { next(e); }
});

router.post("/", authorize("ADMIN", "MANAGER"), async (req, res, next) => {
  try { res.status(201).json(await prisma.category.create({ data: { name: req.body.name } })); }
  catch (e) { next(e); }
});

router.delete("/:id", authorize("ADMIN"), async (req, res, next) => {
  try { await prisma.category.delete({ where: { id: req.params.id } }); res.status(204).send(); }
  catch (e) { next(e); }
});

module.exports = router;
