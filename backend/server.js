const express = require("express");
const cors = require("cors");

const originalLog = console.log;
const originalWarn = console.warn;
console.log = () => {};
console.warn = () => {};
require("dotenv").config();
console.log = originalLog;
console.warn = originalWarn;

const app = express();

process.on("uncaughtException", () => {
  process.exit(1);
});

process.on("unhandledRejection", () => {
  process.exit(1);
});

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.options(/.*/, cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

try {
  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/projects", require("./routes/projects"));
  app.use("/api/tasks", require("./routes/tasks"));
  app.use("/api/admin", require("./routes/admin"));
} catch (err) {
  process.exit(1);
}

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", () => {
  process.exit(1);
});
