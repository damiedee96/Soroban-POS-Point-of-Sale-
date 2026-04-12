const router = require("express").Router();
const c = require("../controllers/inventory.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", c.list);
router.get("/low-stock", c.lowStock);
router.put("/:productId/:branchId", authorize("ADMIN", "MANAGER"), c.adjust);

module.exports = router;
