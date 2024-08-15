const { auth, db } = require("./config/firebase");

const registerUser = async (req, res) => {
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
};

const loginUser = async (req, res) => {
  const { email, motDePasse } = req.body;
  try {
    const user = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(user.uid);
    res.status(200).json({ token: customToken });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const logoutUser = async (req, res) => {
  res.status(200).send("User logged out");
};

module.exports = { registerUser, loginUser, logoutUser };
