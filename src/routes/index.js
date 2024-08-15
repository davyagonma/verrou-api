const express = require("express");
const { registerItem, searchItems, alertItem, defaulte } = require("./controllers/itemController");
const { registerUser, loginUser, logoutUser } = require("./controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes d"authentification
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

// // Routes pour la gestion des biens
router.post("/items", verifyToken, upload.single("photo"), registerItem);
router.get("/items", searchItems);
router.get("/", (req, res) => {
    res.json({message: 'API en ligne ! '});
});
router.post("/items/alert", verifyToken, alertItem);

module.exports = router;
