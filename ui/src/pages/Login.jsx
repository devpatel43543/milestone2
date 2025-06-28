import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, getCurrentUser } from "../services/AuthService";
import frontEndRoutes from "../constants/frontendRoutes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        navigate(frontEndRoutes.HOME); // Redirect to home if authenticated
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn(email, password);
      const accessToken = res.AuthenticationResult.AccessToken;
      const idToken = res.AuthenticationResult.IdToken;
      // Decode the ID token to get the user sub (user id)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const userId = payload.sub;
      localStorage.setItem("accessToken", accessToken);
      console.log("Access Token:", accessToken);
      console.log("User ID (sub):", userId);
      navigate(frontEndRoutes.HOME);
    } catch (err) {
      setError("Login failed: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to={frontEndRoutes.REGISTER} className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
          {/* Optional: Uncomment to add Forgot Password link after implementing forgotPassword in AuthService.js */}
          {/* <p className="text-center text-sm text-gray-600 mt-2">
            Forgot your password?{" "}
            <Link to={frontEndRoutes.FORGOT_PASSWORD} className="text-blue-600 hover:underline">
              Reset Password
            </Link>
          </p> */}
        </form>
      </div>
    </div>
  );
};

export default Login;