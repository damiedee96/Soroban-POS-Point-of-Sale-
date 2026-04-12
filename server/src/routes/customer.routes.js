const router = require("express").Router();
const c = require("../controllers/customer.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", c.list);
router.get("/:id", c.get);
router.post("/", c.create);
router.put("/:id", c.update);

module.exports = router;
