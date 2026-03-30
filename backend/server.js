// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// require("dotenv").config();
// const mongoose = require("mongoose");
// const Patient = require("./models/Patient");

// const app = express();
// const server = http.createServer(app);

// // 👇 Socket.io setup
// const io = new Server(server, {
//   cors: {
//     origin: "https://qr-registration-system.vercel.app",
//   },
// });

// // Middleware
// // app.use(cors());

// app.use(cors({
//   origin: "https://qr-registration-system.vercel.app", // (later restrict to Vercel URL)
// }));

// app.use(express.json());

// // MongoDB connect
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB Connected ✅"))
//   .catch((err) => console.log(err));

// // Test route
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// // POST route (IMPORTANT)
// app.post("/register", async (req, res) => {
//   try {
//     const newPatient = new Patient(req.body);
//     await newPatient.save();

//     console.log("Saved to DB:", newPatient);

//     // 🔥 EMIT EVENT
//     io.emit("new_patient", newPatient);

//     res.json({
//       message: "Patient registered & saved ✅",
//       data: newPatient,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
const mongoose = require("mongoose");
const Patient = require("./models/Patient");

const app = express();
const server = http.createServer(app);

// ✅ Middleware
app.use(cors({
  origin: "https://qr-registration-system.vercel.app",
}));
app.use(express.json());

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: "https://qr-registration-system.vercel.app",
  },
});

// ✅ MongoDB connect (FIXED)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Mongo Error:", error);
    process.exit(1); // stop server if DB fails
  }
};

// 👉 Connect DB FIRST
connectDB();

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ POST route (SAFE)
app.post("/register", async (req, res) => {
  try {
    // 🔥 ensure DB connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "DB not connected" });
    }

    const { name, age, mobile, gender } = req.body;

    if (!name || !age || !mobile || !gender) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newPatient = new Patient({
      name,
      age: Number(age),
      mobile,
      gender,
    });

    await newPatient.save();

    console.log("Saved to DB:", newPatient);

    // 🔥 Emit event
    io.emit("new_patient", newPatient);

    res.json({
      message: "Patient registered & saved ✅",
      data: newPatient,
    });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});