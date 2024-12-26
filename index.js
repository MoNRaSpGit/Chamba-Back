const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Configuración del pool de conexiones MySQL
const db = mysql.createPool({
    host: "b0cjyt4hyfsobbbxc04p-mysql.services.clever-cloud.com",
    user: "usrweyh3z65hle1p",
    password: "arlNRzFJJ7WbqossOnzP",
    database: "b0cjyt4hyfsobbbxc04p",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10, // Ajusta según la carga esperada
    queueLimit: 0,
});

// Probar la conexión al iniciar el servidor
db.getConnection((err, connection) => {
    if (err) {
        console.error("Error al conectar al pool de MySQL:", err);
        process.exit(1); // Finaliza la aplicación si hay un problema
    } else {
        console.log("Conexión al pool de MySQL establecida");
        connection.release(); // Libera la conexión de prueba
    }
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
        if (err) {
            console.error("Error al crear tabla:", err);
        } else {
            console.log("Tabla de usuarios verificada/creada");
        }
    }
);

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
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
