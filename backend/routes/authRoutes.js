const express = require("express");
const { register, login, verifyToken } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "Ini halaman yang dilindungi!", user: req.user });
});

module.exports = router;
