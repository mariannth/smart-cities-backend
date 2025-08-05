const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Registro de usuarios
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validar que no se registre como admin
        if (role === "admin") {
            return res.status(403).json({
                error: "No se permite registrar administradores desde el formulario público.",
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });

        await newUser.save();

        return res.status(201).json({
            user: {
                username: newUser.username,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Error en el registro:", error);
        return res.status(500).json({ error: "Error al registrar el usuario" });
    }
};

// ✅ Login de usuarios
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Intentando login con:", username);

        const user = await User.findOne({ username });
        if (!user) {
            console.log("Usuario no encontrado");
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log("Contraseña inválida");
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { username: user.username, role: user.role },
            "secreto",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            user: { username: user.username, role: user.role },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};
