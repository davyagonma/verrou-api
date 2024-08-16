const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/app");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
