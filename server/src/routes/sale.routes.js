const router = require("express").Router();
const c = require("../controllers/sale.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", c.list);
router.get("/:id", c.get);
router.post("/", c.create);
router.patch("/:id/refund", authorize("ADMIN", "MANAGER"), c.refund);

module.exports = router;
