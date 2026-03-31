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

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// require("dotenv").config();
// const mongoose = require("mongoose");
// const Patient = require("./models/Patient");

// const app = express();
// const server = http.createServer(app);

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ Socket.io
// const io = new Server(server, {
//   cors: {
//     origin: "*", //origin: "*" means it will accept connections from any website (useful for development).
//   },
// });

// // ✅ MongoDB connect (FIXED)
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("MongoDB Connected ✅");
//   } catch (error) {
//     console.log("Mongo Error:", error);
//     process.exit(1); // stop server if DB fails
//   }
// };

// // 👉 Connect DB FIRST
// connectDB();

// // ✅ Test route
// app.get("/", (req, res) => {
//   res.send("Backend is running 🚀");
// });

// // ✅ Socket connection
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// // ✅ POST route (SAFE)
// app.post("/register", async (req, res) => {
//   try {
//     // 🔥 ensure DB connected
//     if (mongoose.connection.readyState !== 1) {
//       return res.status(500).json({ error: "DB not connected" });
//     }

//     const { name, age, mobile, gender } = req.body;

//     if (!name || !age || !mobile || !gender) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const newPatient = new Patient({
//       name,
//       age: Number(age),
//       mobile,
//       gender,
//     });

//     await newPatient.save();

//     console.log("Saved to DB:", newPatient);

//     // 🔥 Emit event
//     io.emit("new_patient", newPatient);

//     res.json({
//       message: "Patient registered & saved ✅",
//       data: newPatient,
//     });
//   } catch (error) {
//     console.log("ERROR:", error);
//     res.status(500).json({ error: error.message });
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
app.use(cors());
app.use(express.json());

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ✅ MongoDB connect
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.log("Mongo Error:", error);
    process.exit(1);
  }
};

connectDB();

// ================= ROUTES =================

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ GET all patients (Dashboard)
app.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching patients" });
  }
});

// ✅ UPDATE patient (Vitals + Symptoms)
app.put("/patient/:id", async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

    // 🔥 optional: emit update event
    io.emit("patient_updated", updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error updating patient" });
  }
});

// ✅ POST register (QR form)
app.post("/register", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "DB not connected" });
    }

    let { name, age, mobile, gender } = req.body;

    // 🔥 Clean mobile (remove +91 if present)
    mobile = mobile.replace("+91", "");

    // ✅ Validation
    const indiaMobileRegex = /^[6-9]\d{9}$/;

    if (!indiaMobileRegex.test(mobile)) {
      return res.status(400).json({
        error: "Invalid Indian mobile number.",
      });
    }

    if (!name || !age || !mobile || !gender) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const newPatient = new Patient({
      name,
      age: Number(age),
      mobile: "+91" + mobile, // store with +91
      gender,
      status: "waiting",
    });

    await newPatient.save();

    console.log("Saved to DB:", newPatient);

    // 🔥 Real-time emit
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

// ================= SOCKET =================

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});