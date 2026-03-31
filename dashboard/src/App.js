import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const BASE_URL = "https://qr-registration-system.onrender.com";
const socket = io(BASE_URL);

function App() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);

  const [vitals, setVitals] = useState({
    spo2: "",
    bp: "",
    weight: "",
    temperature: "",
  });

  const [symptoms, setSymptoms] = useState("");

  // 🔹 Load old patients
  useEffect(() => {
    axios.get(`${BASE_URL}/patients`)
      .then(res => setPatients(res.data))
      .catch(err => console.log(err));
  }, []);

  // 🔹 Real-time new patients
  useEffect(() => {
    socket.on("new_patient", (data) => {
      setPatients(prev => [data, ...prev]);
    });

    return () => socket.off("new_patient");
  }, []);

  // 🔹 Save vitals
  const saveVitals = async () => {
    try {
      await axios.put(`${BASE_URL}/patient/${selected._id}`, {
        vitals,
        symptoms,
      });

      alert("Saved ✅");
      setSelected(null);
    } catch (err) {
      console.log(err);
      alert("Error saving ❌");
    }
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      
      {/* LEFT SIDE - PATIENT LIST */}
      <div style={{ width: "40%", borderRight: "1px solid gray", paddingRight: "20px" }}>
        <h2>Patients</h2>

        {patients.map((p) => (
          <div
            key={p._id}
            onClick={() => setSelected(p)}
            style={{
              padding: "10px",
              margin: "10px 0",
              border: "1px solid black",
              cursor: "pointer"
            }}
          >
            <b>{p.name}</b> ({p.age})
          </div>
        ))}
      </div>

      {/* RIGHT SIDE - DETAILS */}
      <div style={{ width: "60%", paddingLeft: "20px" }}>
        
        {!selected ? (
          <h3>Select a patient</h3>
        ) : (
          <div>
            <h2>{selected.name}</h2>

            <p>Age: {selected.age}</p>
            <p>Gender: {selected.gender}</p>
            <p>Mobile: {selected.mobile}</p>

            <h3>Vitals</h3>

            <input
              placeholder="SpO2"
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
            /><br /><br />

            <input
              placeholder="BP"
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
            /><br /><br />

            <input
              placeholder="Weight"
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
            /><br /><br />

            <input
              placeholder="Temperature"
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
            /><br /><br />

            <h3>Symptoms</h3>

            <input
              placeholder="Enter symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ width: "100%" }}
            />

            <br /><br />

            <button onClick={saveVitals}>
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;