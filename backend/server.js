const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      res.status(500).send("Error fetching customers");
      return;
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
