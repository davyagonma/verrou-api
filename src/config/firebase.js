const admin = require("firebase-admin");
const serviceAccount = require("src/config/trouvemonbien-8cb58-firebase-adminsdk-qm0jt-0dcc0e6b8a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "trouvemonbien-8cb58.appspot.com"
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };


