const router = require("express").Router();
const { register, login, me, listUsers } = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.get("/users", authenticate, authorize("ADMIN", "MANAGER"), listUsers);

module.exports = router;
