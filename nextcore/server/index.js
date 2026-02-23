const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");

const products = require("./routes/products");
const categories = require("./routes/categories");
const providers = require("./routes/providers");
const movements = require("./routes/movements");
const reportsProxy = require("./routes/reportsProxy");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", products);
app.use("/api/categories", categories);
app.use("/api/providers", providers);
app.use("/api/movements", movements);
app.use("/api/reports", reportsProxy);

// React build (Vite) en /public
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`NextCore AppWeb on :${PORT}`));