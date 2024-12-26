const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: "*", // Permitir todas las orígenes
  }));
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





// Endpoint para registrar usuarios
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Log de los datos recibidos
    console.log("Datos recibidos en el registro:", { username, email, password });

    // Validación de datos
    if (!username || !email || !password) {
      console.error("Datos incompletos en el registro");
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Contraseña encriptada:", hashedPassword);

    // Insertar datos en la base de datos
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err) => {
        if (err) {
          // Error por correo duplicado
          if (err.code === "ER_DUP_ENTRY") {
            console.error("Error: El correo ya está registrado");
            return res.status(400).json({ error: "El correo ya está registrado" });
          }
          // Otro error
          console.error("Error al insertar en la base de datos:", err);
          return res.status(500).json({ error: "Error al registrar usuario" });
        } else {
          console.log("Usuario registrado exitosamente:", { username, email });
          res.json({ message: "Usuario registrado exitosamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error inesperado en el registro:", error);
    res.status(500).json({ error: "Error inesperado en el servidor" });
  }
});

  



// Endpoint para iniciar sesión
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      res.status(500).json({ error: "Error en el servidor" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
    } else {
      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        res.json({ message: "Inicio de sesión exitoso", username: user.username });
      } else {
        res.status(400).json({ error: "Contraseña incorrecta" });
      }
    }
  });
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
