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

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validar datos
    if (!username || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Verificar credenciales en la base de datos
    db.query(
        "SELECT id, username, email, address, role FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Error en el servidor" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }

            // Usuario encontrado, devolver sus datos
            const user = results[0];
            res.json({ user });
        }
    );
});


// Endpoint para registrar usuarios
app.post("/register", (req, res) => {
    const { username, email, password, address, role } = req.body;

    // Validar datos
    if (!username || !email || !password || !address || !role) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Validar el rol
    if (!["user", "worker"].includes(role)) {
        return res.status(400).json({ error: "Rol inválido" });
    }

    // Insertar los datos directamente en la base de datos
    db.query(
        "INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
        [username, email, password, address, role],
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
