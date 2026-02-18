const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ---------------- INITIAL DATA FUNCTION ----------------

function getInitialData() {
  return {
    ICU: 10,
    General: 30,
    Pediatric: 8,
    Maternity: 6,
    Isolation: 12,
    blood: {
      "A+": 15,
      "O-": 6,
      "B+": 10
    }
  };
}

let hospitalData = getInitialData();
let icuHistory = [];
let sensorPaused = false;

// ---------------- API ROUTES ----------------

app.get("/data", (req, res) => {
  res.json(hospitalData);
});

app.post("/simulate-surge", (req, res) => {
  hospitalData.ICU = Math.max(0, hospitalData.ICU - 5);
  hospitalData.blood["O-"] = Math.max(0, hospitalData.blood["O-"] - 2);

  io.emit("updateData", hospitalData);
  io.emit("alert", "🚨 Emergency Surge Detected!");

  res.json({ message: "Surge simulated" });
});

app.post("/reset", (req, res) => {

  // Pause sensor updates briefly
  sensorPaused = true;

  hospitalData = getInitialData();
  icuHistory = [];

  io.emit("updateData", hospitalData);
  io.emit("alert", "✅ System Reset Successfully");

  // Resume sensor after 5 seconds
  setTimeout(() => {
    sensorPaused = false;
  }, 5000);

  res.json({ message: "System reset" });
});

// ---------------- AI + SENSOR SIMULATION ----------------

setInterval(() => {

  if (sensorPaused) return;

  const bedChange = Math.floor(Math.random() * 2); // smaller drop

  hospitalData.ICU = Math.max(0, hospitalData.ICU - bedChange);
  hospitalData.General = Math.max(0, hospitalData.General - bedChange);
  hospitalData.blood["O-"] = Math.max(0, hospitalData.blood["O-"] - 1);

  icuHistory.push(hospitalData.ICU);
  if (icuHistory.length > 3) {
    icuHistory.shift();
  }

  if (
    icuHistory.length === 3 &&
    icuHistory[0] > icuHistory[1] &&
    icuHistory[1] > icuHistory[2]
  ) {
    io.emit("alert", "⚠ AI Prediction: ICU capacity decreasing rapidly!");
  }

  if (hospitalData.ICU <= 2 && hospitalData.ICU > 0) {
    io.emit("alert", "🚨 CRITICAL: ICU Almost Full!");
  }

  io.emit("updateData", hospitalData);

}, 10000);

// ---------------- SOCKET ----------------

io.on("connection", (socket) => {
  console.log("User connected");
});

// ---------------- START SERVER ----------------

server.listen(5000, () => {
  console.log("Server running on port 5000");
});



