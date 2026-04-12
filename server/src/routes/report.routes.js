const router = require("express").Router();
const c = require("../controllers/report.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate, authorize("ADMIN", "MANAGER"));
router.get("/summary", c.summary);
router.get("/sales-by-period", c.salesByPeriod);
router.get("/top-products", c.topProducts);
router.get("/staff-performance", c.staffPerformance);

module.exports = router;
