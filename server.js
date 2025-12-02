const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

// Ruta base de prueba
app.get("/", (req, res) => {
    res.send("🚀 API Smart Cities Backend funcionando correctamente.");
});

// Conexión a MongoDB y arranque del servidor
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Conectado a MongoDB Atlas");
        app.listen(PORT, () =>
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        console.error("❌ Error conectando a MongoDB:", err);
        process.exit(1); // Detener el proceso si no hay DB
    });