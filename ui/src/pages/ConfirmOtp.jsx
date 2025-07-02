import React, { useState } from "react";
import { confirmSignUp } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import frontEndRoutes from "../constants/frontendRoutes";

const ConfirmOtp = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("pendingEmail");

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    
    // Basic OTP validation (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await confirmSignUp(email, otp);
      alert("Email confirmed! Please login.");
      localStorage.removeItem("pendingEmail");
      navigate(frontEndRoutes.LOGIN);
    } catch (err) {
      setError("Confirmation failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify Your Email</h2>
        <div>
          <p className="text-center text-sm text-gray-600 mb-6">
            Enter the 6-digit code sent to {email || "your email"}
          </p>
        </div>
        <div className="mb-4">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            OTP Code
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? "Verifying..." : "Confirm Email"}
        </button>
      </div>
    </div>
  );
};

export default ConfirmOtp;