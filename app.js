const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin"); // Assurez-vous que firebase-admin est importé correctement
const multer = require("multer");

const serviceAccount = {
  "type": "service_account",
  "project_id": "trouvemonbien-8cb58",
  "private_key_id": "0dcc0e6b8a4636c37892472d0b9827e4008b440b",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1Gjr31P7ACJUF\no1eQcWavo/Sm0HdNPWLQsDvQkfSXjeNFEA/m+sAVPgyUPitte+xly4yn/OphdZez\nCk8iTPw1mVdPfltx3354jMA/00Weu4usMCwwYexyfl+8dAz2g98yKkd1OXB2tphc\n48yF4EueMUiRL110tvM7un8k9IJwQCrdbFMfhA+aexZqp8+PWBBYtjyYjd6cSgvw\nh+F42CwMeKkHEpuLswMvNAJ7yg/bx9vajP0L4FVQ0ejBYt2mLdu4gGIkWa7eatBb\nrY07wRq6xJOVEIDoHO6+CNRkfremm+pw0JH1Rrawp3tHqn0gkoWWi+PT8iz4LDT7\n2AxAq8evAgMBAAECggEAV99FU3EWtqizXgv2ddCASaLdF3+5E1JAuw93xmi7bDnd\nV2pGvQVX5Da6NcfAnJvvhSjxs6TlOKqtE6Nh6DvAeGVR1vFxf1w46lcpBQ8HDdDk\nIYUyO7uX1an529/XVlmAF8Ap8fgP2JoabZ/eYesF5dj14/Q+fV4zwPxpqs206K92\nhViBuDgiYkaXF/KkuxyAAuKRKb5eFECqz8jgkE7Oft8vmbkw4XZtFiwl0wddi3H5\nILxZM1yb1HDZawWLrHnZbjxyfyUzK/BLh/Cz4DSP/jOyZT47Hrd9l44tyatozW3O\nIdR0TpOa2q6vcpECH8PnNR7YTQ8meUD9NnCPDidFoQKBgQD6cpxSiUtzk0pRcq9y\n5da0QJjbSPjwsICRr9RRP8ELoqc2igwZPpMINvDQFG2LiigwnrOvLZ/yMxZVlXh9\nIXpajoFF1bWLa21+ktXRXuv0Pbi0YmB2hOfNnbGDylchN2cVfjcTdpFYS6KcnsjT\nEoU16bzloxZe86zvWyakqJK0UQKBgQC5Hg7kjpMDM2uoBcNNojnKCaa6/+7naUPk\n2s7R3ag1HSvX3rJTz+E4xOfxmGNIZFZMqHaYv7N+HgqNVf8DWVYs0Uvd6Rf/68CZ\nKsKHtjf0D8U9SyPmw6HfvT+ceNDOiDTgKC//leciRUmSf9HnXJ4FOSM4/jNoIFcg\nyvwFeeO7/wKBgQCYvYdK6wLCJOUhUUFhYH0WB4Nx0UpJeEuhDkv9lVVFpFg4ce65\nAqmnS+KH9L1uab7jEBbj0n6GttN7NKJ8Jgu56Mk8bv6+XbE0jZarjyl2FqJsGMdd\n4OaCRxc5GhETZ/eNayFp1FkGMXKl9EzkNZpabAfRQSpmlFQ20i96Inj+UQKBgBo/\nzeLQ6L3Cc9iOgKQohcNFXRQVKH496fewozUVFj351fa1SFokFw6itTUH48QnHime\nlbqRLFWM0vg5ooCKEXMndneQDuwmNNhDPPRbfVGpTtGjLwMQ6Io+Xp/Ebe9rVvwW\nFsBKNE0iwAz6/PuuoWWiNYFmYkm4lEI9JkFsiENnAoGBAPCuffDpQyxPrfrxuvEU\nGz/ghctXFzluK00JOToo56QnBVPCJ1P6yX5LR3Tsj7nJBpUpu6Lr578A6kpT6GKW\nRge340KzkcsQfoDzL7Z0vrfaKncGpMVRcLTlSf5ykfOdyJ1cQIXqM3A75Pxu2wsJ\nwwuodHzwyl8X1ja4dyUgJMkw\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-qm0jt@trouvemonbien-8cb58.iam.gserviceaccount.com",
  "client_id": "114707665443529141346",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-qm0jt%40trouvemonbien-8cb58.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};


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
