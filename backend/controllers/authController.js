const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

// Registrasi User
const register = async (req, res) => {
    const { nama_lengkap, email, username, password } = req.body;

    if (!nama_lengkap || !email || !username || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi!" });
    }

    try {
        // Hash password dengan bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        userModel.createUser(nama_lengkap, email, username, hashedPassword, (err, result) => {
            if (err) {
                console.error("Error saat register:", err);
                return res.status(500).json({ message: "Terjadi kesalahan server!" });
            }
            res.status(201).json({ message: "Registrasi berhasil!" });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat registrasi!" });
    }
};

// Login User
const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username dan password wajib diisi!" });
    }

    userModel.findUserByUsername(username, async (err, user) => {
        if (err) {
            console.error("Error saat login:", err);
            return res.status(500).json({ message: "Terjadi kesalahan server!" });
        }
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan!" });
        }

        // Bandingkan password dengan hash bcrypt
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            secretKey,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login berhasil!", user_id: user.id, nama_lengkap: user.nama_lengkap, token });
    });
};

// Middleware Verifikasi Token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token tidak tersedia atau format salah!" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error("Error saat verifikasi token:", err);
            return res.status(401).json({ message: "Token tidak valid!" });
        }
        req.user = decoded;
        next();
    });
};

module.exports = { register, login, verifyToken };
