const bcrypt = require("bcryptjs"); // Usamos bcryptjs para evitar errores de compilación
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Registro de usuarios
exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validar campos vacíos
        if (!username || !password) {
            return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
        }

        // Validar que no se registre como admin directamente
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
        
        // Asignar rol por defecto si no viene
        const userRole = role || "user"; 

        const newUser = new User({ username, password: hashedPassword, role: userRole });

        await newUser.save();

        return res.status(201).json({
            message: "Usuario registrado con éxito",
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Error en el registro:", error);
        return res.status(500).json({ error: "Error interno al registrar el usuario" });
    }
};

// ✅ Login de usuarios
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Usuario o contraseña incorrectos" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
        }

        // Generar Token con la clave del .env
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "8h" } // Token dura 8 horas
        );

        res.status(200).json({
            message: "Login exitoso",
            token,
            user: { 
                id: user._id,
                username: user.username, 
                role: user.role 
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};