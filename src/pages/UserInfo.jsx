import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function UserInfo() {

  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    phone: ""
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!user) {
      alert("User session expired. Please login again.");
      return;
    }

    try {

      const response = await fetch("https://ecg-backend-production-af9b.up.railway.app/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: user.email,
          full_name: formData.full_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Profile update failed");
      }

      /* Split full name */
      const nameParts = formData.full_name.trim().split(" ");

      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      /* Updated user object */
      const updatedUser = {
        ...user,
        name: formData.full_name,
        firstName: firstName,
        lastName: lastName,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        is_profile_complete: true
      };

      /* Update context */
      setUser(updatedUser);

      /* Update localStorage */
      localStorage.setItem("user", JSON.stringify(updatedUser));

      /* Redirect to dashboard */
      navigate("/dashboard");

    } catch (error) {

      console.error(error);
      alert(error.message);

    }
  };

  return (

    <div className="flex items-center justify-center h-screen bg-gray-50">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-96"
      >

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Complete Your Profile
        </h2>

        <div className="space-y-4">

          {/* Full Name */}
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Age"
            required
            onChange={handleChange}
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-green-600"
          />

          {/* Gender */}
          <select
            name="gender"
            required
            onChange={handleChange}
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* Phone */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            onChange={handleChange}
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-green-600"
          />

        </div>

        <button
          type="submit"
          className="w-full text-white py-3 rounded-lg mt-6 font-medium"
          style={{ backgroundColor: "#047857" }}
        >
          Next
        </button>

      </form>

    </div>

  );
}