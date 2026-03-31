import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://qr-registration-system.onrender.com");

function App() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    mobile: "",
    gender: "",
    countryCode: "+91",
  });

  // 🔥 SOCKET LISTENER
  useEffect(() => {
    socket.on("new_patient", (data) => {
      console.log("New Patient 🔥:", data);
      alert("New patient registered!");
    });

    return () => socket.off("new_patient");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    if (name === "age") {
      if (value === "") {
        setFormData({ ...formData, [name]: value });
        return;
      }
      const num = Number(value);
      if (num < 0 || num > 120) return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.age ||
      !formData.mobile ||
      !formData.gender
    ) {
      alert("All fields are required ❌");
      return;
    }

    if (formData.mobile.length !== 10) {
      alert("Mobile number must be 10 digits ❌");
      return;
    }

    // 2. Check if it starts with 6, 7, 8, or 9 (Indian standard)
    const firstDigit = formData.mobile.charAt(0);
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      alert("Invalid number! 🇮🇳");
      return;
    }

    // ✅ combine mobile
    const finalData = {
      ...formData,
      mobile: formData.countryCode + formData.mobile,
    };

    delete finalData.countryCode;

    try {
      const res = await axios.post(
        "https://qr-registration-system.onrender.com/register",
        finalData
      );

      console.log(res.data);
      alert("Patient Registered ✅");

      setFormData({
        name: "",
        age: "",
        mobile: "",
        gender: "",
        countryCode: "+91",
      });
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Registration</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <br /><br />

        <div>
          <input value="+91" disabled style={{ width: "50px" }} />
          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>
        <br /><br />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default App;