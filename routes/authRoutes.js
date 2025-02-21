const router = require("express").Router();
const {
  register,
  login,
  getAllUsers,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);


module.exports = router;
