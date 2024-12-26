const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de la base de datos MySQL
const db = mysql.createConnection({
    host: "b0cjyt4hyfsobbbxc04p-mysql.services.clever-cloud.com",
    user: "usrweyh3z65hle1p",
    password: "arlNRzFJJ7WbqossOnzP",
    database: "b0cjyt4hyfsobbbxc04p",
    port: 3306,
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error al conectar a MySQL:", err);
        return;
    }
    console.log("Conectado a MySQL en Clever Cloud");
});

// Crear tabla de usuarios si no existe
db.query(
    `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )`,
    (err) => {
        if (err) console.error("Error al crear tabla:", err);
    }
);

// Endpoint para ping
app.get("/", (req, res) => {
    res.send("Servidor activo");
});

// Mantener el servidor activo con un autoping
const startKeepAlive = () => {
    setInterval(() => {
        const https = require("https");
        const url = "https://chamba-back.onrender.com"; // URL pública de Render

        https.get(url, (res) => {
            console.log(`Ping al servidor - Status: ${res.statusCode}`);
        }).on("error", (err) => {
            console.error("Error al hacer ping:", err.message);
        });
    }, 5 * 60 * 1000); // Cada 5 minutos
};

// Endpoint para registrar usuarios
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    // Validar datos
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Insertar los datos directamente en la base de datos
    db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, password],
        (err) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ error: "El correo ya está registrado" });
                }
                return res.status(500).json({ error: "Error al registrar usuario" });
            }
            res.json({ message: "Usuario registrado exitosamente" });
        }
    );
});

// Endpoint para contar usuarios registrados
app.get("/user-count", (req, res) => {
    db.query("SELECT COUNT(*) AS count FROM users", (err, results) => {
        if (err) {
            res.status(500).json({ error: "Error al obtener el conteo de usuarios" });
        } else {
            res.json({ count: results[0].count });
        }
    });
});

// Iniciar el servidor
startKeepAlive(); // Iniciar el autoping
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
