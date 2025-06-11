const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const notesRoutes = require("./routes/notesRoutes");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api", notesRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
