const router = require("express").Router();
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", async (req, res, next) => {
  try { res.json(await prisma.branch.findMany()); } catch (e) { next(e); }
});
router.post("/", authorize("ADMIN"), async (req, res, next) => {
  try { res.status(201).json(await prisma.branch.create({ data: req.body })); } catch (e) { next(e); }
});

module.exports = router;
