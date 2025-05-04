const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

// --- Database Setup ---
const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.serialize(() => {
      // Enable foreign key constraints
      db.run("PRAGMA foreign_keys = ON;");

      db.run(
        `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                cpf TEXT UNIQUE NOT NULL,
                birthdate TEXT NOT NULL,
                phone TEXT,
                marital_status TEXT,
                education TEXT
            )`,
        (err) => {
          if (err) console.error("Error creating users table:", err.message);
        }
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS service_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                request_date TEXT NOT NULL,
                service_name TEXT NOT NULL,
                status TEXT NOT NULL,
                price REAL NOT NULL,
                predicted_date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Optional: delete requests if user is deleted
            )`,
        (err) => {
          if (err)
            console.error(
              "Error creating service_requests table:",
              err.message
            );
        }
      );
    });
  }
});

// --- Middleware ---
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Helper function to get user ID from email ---
// NOTE: In a real app, use user ID from session/token
function getUserIdByEmail(email, callback) {
  if (!email) {
    return callback(new Error("Email is required to find user ID"), null);
  }
  const sql = "SELECT id FROM users WHERE email = ?";
  db.get(sql, [email], (err, row) => {
    if (err) {
      console.error("DB error getting user ID by email:", err.message);
      return callback(err, null);
    }
    if (!row) {
      return callback(new Error(`User not found for email: ${email}`), null);
    }
    callback(null, row.id); // Pass the user ID to the callback
  });
}

// --- User Routes ---
app.post("/api/register", async (req, res) => {
  console.log("Received registration data:", req.body);
  const {
    email,
    password,
    name,
    cpf,
    birthdate,
    phone,
    marital_status,
    education,
  } = req.body;

  if (!email || !password || !name || !cpf || !birthdate) {
    return res
      .status(400)
      .json({ success: false, message: "Campos obrigatórios faltando." });
  }

  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users (email, password_hash, name, cpf, birthdate, phone, marital_status, education)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      sql,
      [
        email,
        password_hash,
        name,
        cpf,
        birthdate,
        phone,
        marital_status,
        education,
      ],
      function (err) {
        if (err) {
          console.error("DB error registration:", err.message);
          if (err.message.includes("UNIQUE constraint failed")) {
            return res.status(409).json({
              success: false,
              message: "E-mail ou CPF já cadastrado.",
            });
          }
          return res
            .status(500)
            .json({ success: false, message: "Erro ao registrar usuário." });
        }
        res
          .status(201)
          .json({ success: true, message: "Usuário registrado com sucesso." });
      }
    );
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro interno no servidor durante o registro.",
    });
  }
});

app.post("/api/login", (req, res) => {
  console.log("Received login data:", req.body);
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "E-mail e senha são obrigatórios." });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], async (err, user) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor." });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Usuário ou senha inválidos." });

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (match) {
        // NOTE: Generate session/token here in real app
        return res.json({ success: true, message: "Login bem-sucedido" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Usuário ou senha inválidos." });
      }
    } catch (compareError) {
      return res.status(500).json({
        success: false,
        message: "Erro interno ao verificar a senha.",
      });
    }
  });
});

// --- Service Request Routes ---

// GET all requests for a specific user (identified by email for now)
app.get("/api/service-requests", (req, res) => {
  const userEmail = req.query.userEmail; // Get email from query parameter

  getUserIdByEmail(userEmail, (err, userId) => {
    if (err) {
      // If user not found based on email, return empty list or error
      console.log(`Cannot get requests: ${err.message}`);
      return res.status(404).json({ success: false, message: err.message });
      // Alternatively, return empty list: return res.json([]);
    }

    const sql =
      "SELECT * FROM service_requests WHERE user_id = ? ORDER BY request_date ASC";
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error("DB error getting service requests:", err.message);
        return res.status(500).json({
          success: false,
          message: "Erro ao buscar solicitações de serviço.",
        });
      }
      res.json(rows); // Send the list of requests
    });
  });
});

// POST a new service request
app.post("/api/service-requests", (req, res) => {
  console.log("Received new service request:", req.body);
  const {
    userEmail,
    service_name,
    status,
    price,
    predicted_date,
    request_date,
  } = req.body;

  if (
    !service_name ||
    !status ||
    price === undefined ||
    !predicted_date ||
    !request_date
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Dados da solicitação incompletos." });
  }

  getUserIdByEmail(userEmail, (err, userId) => {
    if (err) {
      console.log(`Cannot add request: ${err.message}`);
      return res.status(404).json({ success: false, message: err.message });
    }

    const sql = `INSERT INTO service_requests (user_id, request_date, service_name, status, price, predicted_date)
                     VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      userId,
      request_date,
      service_name,
      status,
      price,
      predicted_date,
    ];

    db.run(sql, params, function (err) {
      // Use function() to get this.lastID
      if (err) {
        console.error("DB error adding service request:", err.message);
        return res.status(500).json({
          success: false,
          message: "Erro ao salvar solicitação de serviço.",
        });
      }
      // Successfully inserted, return success and the new request data (including ID)
      const newRequest = {
        id: this.lastID, // Get the ID of the inserted row
        user_id: userId,
        request_date: request_date,
        service_name: service_name,
        status: status,
        price: price,
        predicted_date: predicted_date,
      };
      res.status(201).json({ success: true, newRequest: newRequest });
    });
  });
});

// DELETE a service request
app.delete("/api/service-requests/:id", (req, res) => {
  const requestId = req.params.id;
  // Get user email from request body for verification (placeholder method)
  const userEmail = req.body.userEmail;
  console.log(
    `Attempting to delete request ${requestId} for user ${userEmail}`
  );

  getUserIdByEmail(userEmail, (err, userId) => {
    if (err) {
      console.log(`Cannot delete request: ${err.message}`);
      return res.status(404).json({ success: false, message: err.message });
    }

    // Verify ownership before deleting (check if request ID belongs to user ID)
    const checkSql = "SELECT user_id FROM service_requests WHERE id = ?";
    db.get(checkSql, [requestId], (err, request) => {
      if (err) {
        console.error("DB error checking request ownership:", err.message);
        return res
          .status(500)
          .json({ success: false, message: "Erro ao verificar solicitação." });
      }
      if (!request) {
        return res
          .status(404)
          .json({ success: false, message: "Solicitação não encontrada." });
      }
      if (request.user_id !== userId) {
        // User does not own this request
        console.warn(
          `User ${userId} (${userEmail}) attempted to delete request ${requestId} owned by user ${request.user_id}`
        );
        return res.status(403).json({
          success: false,
          message: "Você não tem permissão para excluir esta solicitação.",
        });
      }

      // User owns the request, proceed with deletion
      const deleteSql = "DELETE FROM service_requests WHERE id = ?";
      db.run(deleteSql, [requestId], function (err) {
        // Use function() to get this.changes
        if (err) {
          console.error("DB error deleting service request:", err.message);
          return res
            .status(500)
            .json({ success: false, message: "Erro ao excluir solicitação." });
        }
        if (this.changes === 0) {
          // Row was not found, though check above should prevent this
          return res.status(404).json({
            success: false,
            message: "Solicitação não encontrada para exclusão.",
          });
        }
        res.json({
          success: true,
          message: "Solicitação excluída com sucesso.",
        });
      });
    });
  });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Close DB on exit
process.on("SIGINT", () => {
  db.close(() => {
    process.exit(0);
  });
});
