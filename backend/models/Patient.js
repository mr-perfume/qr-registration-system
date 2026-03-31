const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  mobile: {
  type: String,
  required: true,
  unique: true,   // 🔥 
  },
  
  gender: String,

  vitals: {
    spo2: String,
    bp: String,
    weight: String,
    temperature: String,
  },

  symptoms: String,

  status: {
    type: String,
    default: "waiting",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Patient", patientSchema);