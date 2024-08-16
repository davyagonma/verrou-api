const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin"); // Assurez-vous que firebase-admin est importé correctement
const multer = require("multer");

const serviceAccount = require("trouvemonbien-8cb58-firebase-adminsdk-qm0jt-0dcc0e6b8a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "trouvemonbien-8cb58.appspot.com"
});

const { db, bucket } = admin;
const auth = admin.auth(); // Obtenez l'objet auth

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Middleware de vérification du token
const verifyToken = async (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).send("Token is required");

    try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).send("Invalid token");
    }
};

// Routes pour l'authentification
app.post("/api/register", async (req, res) => {
  const { nom, prenom, telephone, email, motDePasse } = req.body;
  try {
    const userRecord = await auth.createUser({
      email,
      password: motDePasse,
      displayName: `${nom} ${prenom}`,
      phoneNumber: telephone,
    });

    await db.collection("utilisateurs").doc(userRecord.uid).set({
      nom,
      prenom,
      telephone,
      email,
      motDePasse, // Note: store hashed password in a real app
    });

    res.status(201).send("Utilisateur enregistré avec succès");
  } catch (error) {
    res.status(400).send(error.message);
  }
});


app.post("/api/login",  async (req, res) => {
  const { email, motDePasse } = req.body;
  try {
    const user = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(user.uid);
    res.status(200).json({ token: customToken });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("api/logout", async (req, res) => {
  res.status(200).send("User logged out");
});



// Routes pour la gestion des biens
app.post("/api/items", verifyToken, upload.single("file"), async (req, res) => {
    const { type, numeroSerie, caracteristiques, details } = req.body;
    const { file } = req;
    if (!file) return res.status(400).send("Photo is required");

    try {
        const blob = bucket.file(`photos/${Date.now()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
        });

        blobStream.on("error", (err) => res.status(500).send(err.message));

        blobStream.on("finish", async () => {
            const photoUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            await db.collection("biens").add({
                utilisateur_id: req.user.uid,
                type,
                numero_serie: numeroSerie,
                caracteristiques,
                photo: photoUrl,
                details,
            });

            res.status(201).send("Bien enregistré avec succès");
        });

        blobStream.end(file.buffer);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/api/items", async (req, res) => {
    const { type, caracteristiques } = req.query;
    try {
        let query = db.collection("biens");
        if (type) query = query.where("type", "==", type);
        if (caracteristiques) query = query.where("caracteristiques", "array-contains-any", caracteristiques.split(","));

        const snapshot = await query.get();
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(items);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/api", (req, res) => {
    res.json({ message: "API en ligne !" });
});

app.post("/api/items/alert", verifyToken, async (req, res) => {
    const { itemId } = req.body;
    try {
        await db.collection("biens").doc(itemId).update({ status: "retrouvé" });
        res.status(200).send("Bien marqué comme retrouvé");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Middleware de gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: "API en ligne mais la route est introuvable !" });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
