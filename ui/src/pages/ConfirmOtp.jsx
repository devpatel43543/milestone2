import React, { useState } from "react";
import { confirmSignUp } from "../services/AuthService"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";
import frontEndRoutes from "../constants/frontendRoutes";

const ConfirmOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("pendingEmail");

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await confirmSignUp(email, otp);
      alert("Email confirmed! Please login.");
      localStorage.removeItem("pendingEmail");
      navigate(frontEndRoutes.LOGIN);
    } catch (err) {
      alert("Confirmation failed: " + err.message);
    }
  };

  return (
    <form onSubmit={handleConfirm}>
      <h2>Enter OTP</h2>
      <input type="text" placeholder="Enter OTP code" onChange={e => setOtp(e.target.value)} required />
      <button type="submit">Confirm Email</button>
    </form>
  );
};

export default ConfirmOtp;
