const express = require("express");
const {db, bucket} = require("firebase");
const multer = require("multer");
// const { registerItem, searchItems, alertItem, defaulte } = require("/itemController");
// const { registerUser, loginUser, logoutUser } = require("authController");
const { verifyToken } = require("authMiddleware");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes d"authentification
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

// // Routes pour la gestion des biens
router.post("/items", verifyToken, async (req, res) => {const {type, 
    numeroSerie, caracteristiques, details} = req.body;
    const {file} = req;
    if (!file) return res.status(400).send("Photo is required");
    try {const blob = bucket.file(`photos/${Date.now()}_${file.originalname}`);
      const blobStream = blob.createWriteStream({metadata: {contentType: file.mimetype,},});
      blobStream.on("error", (err) => res.status(500).send(err.message));
      blobStream.on("finish", async () => {const photoUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        await db.collection("biens").add({utilisateur_id: req.user.uid,
          type,
          numero_serie: numeroSerie,
          caracteristiques,
          photo: photoUrl,
          details,});
  
        res.status(201).send("Bien enregistré avec succès");});
  
      blobStream.end(file.buffer);} catch (error) {res.status(500).send(error.message);}});
  
router.get("/items", async (req, res) => {const {type, caracteristiques} = req.query;
try {let query = db.collection("biens");
  if (type) query = query.where("type", "==", type);
  if (caracteristiques) query = query.where("caracteristiques", "array-contains-any", caracteristiques.split(","));

  const snapshot = await query.get();
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(items);} catch (error) {
  res.status(500).send(error.message);}});
router.get("/", (req, res) => {
    res.json({message: 'API en ligne ! '});
});
router.post("/items/alert", verifyToken, async (req, res) => {const { itemId } = req.body;
try {await db.collection("biens").doc(itemId).update({ status: "retrouvé"});
  res.status(200).send("Bien marqué comme retrouvé");} 
  catch (error) {res.status(500).send(error.message);}}
);

module.exports = router;
