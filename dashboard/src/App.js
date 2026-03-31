// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";

// const BASE_URL = "https://qr-registration-system.onrender.com";
// const socket = io(BASE_URL);



// function App() {
  
//   const [patients, setPatients] = useState([]);
//   const [selected, setSelected] = useState(null);

//   const [vitals, setVitals] = useState({
//     spo2: "",
//     bp: "",
//     weight: "",
//     temperature: "",
//   });

//   const [symptoms, setSymptoms] = useState("");

//   // 🔹 Load old patients
//   useEffect(() => {
//     axios.get(`${BASE_URL}/patients`)
//       .then(res => setPatients(res.data))
//       .catch(err => console.log(err));
//   }, []);

//   // 🔹 Real-time new patients
//   useEffect(() => {
//     socket.on("new_patient", (data) => {
//       setPatients(prev => [data, ...prev]);
//     });

//     return () => socket.off("new_patient");
//   }, []);

//   // 🔹 Save vitals
//   const saveVitals = async () => {
//     try {
//       await axios.put(`${BASE_URL}/patient/${selected._id}`, {
//         vitals,
//         symptoms,
//       });

//       alert("Saved ✅");
//       setSelected(null);
//     } catch (err) {
//       console.log(err);
//       alert("Error saving ❌");
//     }
//   };

//   return (
//     <div style={{ display: "flex", padding: "20px" }}>
      
//       {/* LEFT SIDE - PATIENT LIST */}
//       <div style={{ width: "40%", borderRight: "1px solid gray", paddingRight: "20px" }}>
//         <h2>Patients</h2>

//         {patients.map((p) => (
//           <div
//             key={p._id}
//             onClick={() => setSelected(p)}
//             style={{
//               padding: "10px",
//               margin: "10px 0",
//               border: "1px solid black",
//               cursor: "pointer"
//             }}
//           >
//             <b>{p.name}</b> ({p.age})
//           </div>
//         ))}
//       </div>

//       {/* RIGHT SIDE - DETAILS */}
//       <div style={{ width: "60%", paddingLeft: "20px" }}>
        
//         {!selected ? (
//           <h3>Select a patient</h3>
//         ) : (
//           <div>
//             <h2>{selected.name}</h2>

//             <p>Age: {selected.age}</p>
//             <p>Gender: {selected.gender}</p>
//             <p>Mobile: {selected.mobile}</p>

//             <h3>Vitals</h3>

//             <input
//               placeholder="SpO2"
//               onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
//             /><br /><br />

//             <input
//               placeholder="BP"
//               onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
//             /><br /><br />

//             <input
//               placeholder="Weight"
//               onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
//             /><br /><br />

//             <input
//               placeholder="Temperature"
//               onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
//             /><br /><br />

//             <h3>Symptoms</h3>

//             <input
//               placeholder="Enter symptoms"
//               value={symptoms}
//               onChange={(e) => setSymptoms(e.target.value)}
//               style={{ width: "100%" }}
//             />

//             <br /><br />

//             <button onClick={saveVitals}>
//               Save
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const BASE_URL = "https://qr-registration-system.onrender.com";
const socket = io(BASE_URL);

function App() {
  const [mode, setMode] = useState("list"); // list | add
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    mobile: "",
    gender: "",
  });

  const [vitals, setVitals] = useState({
    spo2: "",
    bp: "",
    weight: "",
    temperature: "",
  });

  const [symptoms, setSymptoms] = useState("");

  // 🔹 Load patients
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

    socket.on("patient_updated", (data) => {
      setPatients(prev =>
        prev.map(p => (p._id === data._id ? data : p))
      );
    });

    return () => {
      socket.off("new_patient");
      socket.off("patient_updated");
    };
  }, []);

  // 🔹 Save vitals (remove from queue)
  const saveVitals = async () => {
    try {
      await axios.put(`${BASE_URL}/patient/${selected._id}`, {
        vitals,
        symptoms,
      });

      setPatients(prev =>
        prev.filter(p => p._id !== selected._id)
      );

      alert("Saved ✅");
      setSelected(null);
    } catch (err) {
      console.log(err);
      alert("Error saving ❌");
    }
  };

  // 🔹 Add patient manually
  const handleAddPatient = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/patient`, {
        ...formData,
        vitals,
        symptoms,
      });

      alert("Patient added ✅");

      setPatients(prev => [res.data, ...prev]);

      setMode("list");
      setFormData({ name: "", age: "", mobile: "", gender: "" });
      setVitals({ spo2: "", bp: "", weight: "", temperature: "" });
      setSymptoms("");

    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>

      {/* LEFT SIDE */}
      <div style={{ width: "40%", borderRight: "1px solid gray", paddingRight: "20px" }}>
        <h2>Patients</h2>

        <button onClick={() => setMode("add")}>
          ➕ Add Patient
        </button>

        <br /><br />

        {patients
          .filter(p => p.status === "waiting")
          .map((p) => (
            <div
              key={p._id}
              onClick={() => {
                setSelected(p);
                setMode("list");
              }}
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

      {/* RIGHT SIDE */}
      <div style={{ width: "60%", paddingLeft: "20px" }}>

        {/* ADD PATIENT MODE */}
        {mode === "add" ? (
          <div>
            <h2>Add Patient</h2>

            <input placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            /><br /><br />

            <input placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            /><br /><br />

            <input placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            /><br /><br />

            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <h3>Vitals</h3>

            <input placeholder="SpO2"
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
            /><br /><br />

            <input placeholder="BP"
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
            /><br /><br />

            <input placeholder="Weight"
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
            /><br /><br />

            <input placeholder="Temperature"
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
            /><br /><br />

            <input placeholder="Symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            /><br /><br />

            <button onClick={handleAddPatient}>Save</button>
            <br /><br />
            <button onClick={() => setMode("list")}>Back</button>
          </div>

        ) : !selected ? (
          <h3>Select a patient</h3>

        ) : (
          <div>
            <h2>{selected.name}</h2>

            <p>Age: {selected.age}</p>
            <p>Gender: {selected.gender}</p>
            <p>Mobile: {selected.mobile}</p>

            <h3>Vitals</h3>

            <input placeholder="SpO2"
              onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
            /><br /><br />

            <input placeholder="BP"
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
            /><br /><br />

            <input placeholder="Weight"
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
            /><br /><br />

            <input placeholder="Temperature"
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

            <button onClick={saveVitals}>Save</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;