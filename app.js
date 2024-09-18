const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin"); // Assurez-vous que firebase-admin est importé correctement
const multer = require("multer");

const { getStorage } = require('firebase-admin/storage');

const serviceAccount = {
  "type": "service_account",
  "project_id": "trouvemonbien-8cb58",
  "private_key_id": "56fd1a4c3188c7bb8c54c8949f327b60736b38c4",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCo7pBc2OQeem2M\nnBvvrEQQjT6snDQSUDfjj7XUn7N4ZwrHOwogWepolOH/7ap10O1SD/Gt+Hw3wxWf\n7d3zQn7z+SHGsaKEYCWyJ5jpUdKWxaTPIQbWU1Xr7tswEa+qZ60ePeqQlySHboDG\nQLanbDfwDZFe8Us/usftTqdSIzaI81JOc0wXQz0b9v+QWw9HBuU+Nn5im5ds7KEG\nFFNVGYjZ7BJ+yz1FmZGmNxCqrvuisOiP9Ujd43E6mgFalN6C7rS/2R/owbfutWLD\n6RT5XNgd65Rg9/angaFqqQuOS5nCCUM8jj0I9rGJy+gG3EPlNJ7HYRtYmFxkGq7j\nRpoaTWt7AgMBAAECggEAJ2nlp6v46T2CMrS3dd9Y0A3MSiR1p7Isn/zHHTEXg+dy\npdIaBjtETBs0cWxHgY552FQc/IyFmtL6yCIMzzU7/nspTLzkIIN4OA0yCXnMKt45\nGhRoDnhKCy5i2F+//v+KbgxfHlYNMUXwaJDvrLc8g9b+jEq61kcjXzQjKLBLiH7v\ne18y85T62wIg9LiKbJjYkyObjcM9kk0i4jYXp+1RJHSBVqwoxiF1UkSOfb2UobyE\nEbpD03j0OSSsbr+8sXdqEDc7syLX7UOEm8KX+bYCBBhTq8Eg2w2G4095NlJZE4e3\nxSWiaBxkwUPcTFG3OtxrPamfOe+gshmmcKUksTTvCQKBgQDeSdVQ5i83N7r/9kPx\n8lrNyLsdz/xkYBWB0aKj3m3KA5UaGGQjJheUdqHSy1cwfYostEWsoThT0QD8UWQC\nM082jOmKaEmxUML+27p1a2ce5hD2lih1/L7B9yiV2vtBlj0shC3LOGxbLXCHqQWu\nXimfOnLMotO7MYOsEr6APaRy6QKBgQDCjTUGo4n3TyBqeKfd+8YZHd2kxnFv0Ops\nPUJmDluQmTgTXFcwc95zKFXmmPtRo9sAsuvD0gokQAlRdT5dRCCm4YEPcGddt7bf\ngviGSP1e+Yy3wiQvFihOzKQJexmj6E/dAug/9b7RlzirF+WCVuOm33cHJuYpnG3/\n8DT4IOREwwKBgQC9la0otVm5t393BTuH5BLMBhKI57W0ijptoTUcm/15WTrWqczm\nKXvc9J0p4qF3SusJG6t9A3e+DLjRej1YnxhFR0N791w6rc3Rfef2c2bc9I2tMf5K\nOwka90iXHtBCbPe5uvYvp+zKiuO54E9nGwpWsovsukbpFd7eaJIvX+Oc2QKBgAP9\nYVkBgZLQzJliYA7tWuKo+iKm7yyb3DLcDsCJCtesTLoY6rDTr3wtF5XjDURfV95r\nzOn3JL4ZkhdZkC3Zd9H0TfFDHNuPKPDsfqxCUu/frkMWeCd/DNSQ3cxT+fKikQC3\nTowBPiiOMVtQ4iQKJCEH9CjxY0b3LkpRYsSz5/qBAoGBAM5VQu4bhFCyxieUUvXk\nfbNERrEwYxLgJueulRpvwOJ13x1P/+ZoLwTxkoWKTiacPRpfW4h0jL2+rT9TwMtb\nLuD0hT5cBG5tIlbwJ8tCgmsZMHTEaNF3nyPi/6lcPiV5MqIpJLgxgolfcK0FM7AQ\noTfSNhFK7itvmAyO/Ul7yYD3\n-----END PRIVATE KEY-----\n",
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
  storageBucket: "trouvemonbien-8cb58.appspot.com",
  databaseURL: "https://trouvemonbien-8cb58-default-rtdb.firebaseio.com"
});






const auth = admin.auth(); // Obtenez l'objet auth
const db = admin.firestore();
const bucket = getStorage().bucket();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Middleware de vérification du token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
    
  // Vérifiez que l'en-tête contient un token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).send("Token is required");
  }

  const token = authHeader.split(" ")[1]; // Récupérer uniquement le token

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

// const token = jwt.sign(payload, 'votre_clé_secrète', { expiresIn: '1d' });
    

    res.status(200).json({ token: customToken });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("api/logout", async (req, res) => {
  res.status(200).send("User logged out");
});



// Routes pour la gestion des biens
app.post("/api/items-old", upload.single("image"), async (req, res) => {
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
          // const photoUrl = `https://storage.googleapis.com`;
          const photoUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          await db.collection("biens").add({
              //id_utilisateur: req.user.uid,
              type,
              //numero,
              caracteristiques,
              image: photoUrl,
              details,
              vole: false
          });

          res.status(201).send("Bien enregistré avec succès");
      });

      blobStream.end(file.buffer);
  } catch (error) {
      res.status(500).send(error.message);
  }
});

app.post("/api/items", async (req, res) => {
  const { type, numero, caracteristiques, details } = req.body;
  try {
    const photoUrl = 'https://storage.googleapis.com';
    await db.collection("biens").add({
      //id_utilisateur: req.user.uid,
      //type: type,
      //numero : numero,
      caracteristiques,
      image: photoUrl,
      details,
      vole: false
  });      

  res.status(201).send("Bien enregistré avec succès");

  }catch (error) {
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
    const { numero } = req.body;
    try {
        await db.collection("biens").doc(numero).update({ vole: false });
        res.status(200).send("Bien marqué comme retrouvé");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/api/items/marquer", verifyToken, async (req, res) => {
  const { numero } = req.body;
  try {
      await db.collection("biens").doc(numero).update({ vole: true });
      res.status(200).send("Bien marqué comme volé");
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
