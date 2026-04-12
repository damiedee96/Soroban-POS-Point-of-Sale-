const router = require("express").Router();
const c = require("../controllers/payment.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);
router.post("/initialize", c.initialize);
router.post("/verify", c.verify);
router.post("/blockchain", c.blockchainPay);

module.exports = router;
