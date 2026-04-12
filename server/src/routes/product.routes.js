const router = require("express").Router();
const c = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.use(authenticate);
router.get("/", c.list);
router.get("/:id", c.get);
router.post("/", authorize("ADMIN", "MANAGER"), c.create);
router.put("/:id", authorize("ADMIN", "MANAGER"), c.update);
router.delete("/:id", authorize("ADMIN"), c.remove);

module.exports = router;
