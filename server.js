const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB");
        app.listen(process.env.PORT, () =>
            console.log(`🚀 Servidor en http://localhost:${process.env.PORT}`)
        );
    })
    .catch((err) => console.error("❌ Error en la conexión a MongoDB", err));
