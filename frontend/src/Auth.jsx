import "./Auth.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "";

function Auth() {
  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: ""
    });

    setError("");
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const endpoint = isSignup
      ? "/api/auth/signup"
      : "/api/auth/signin";

    const payload = isSignup
      ? form
      : {
          email: form.email,
          password: form.password
        };

    try {
      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/");
    } catch (error) {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="authPage">

      <div className="authCard">

        <div className="brand">
          <div className="brandLogo">
            <i className="fa-solid fa-brain"></i>
          </div>

          <h2>PrepMind</h2>
        </div>

        <h1 className="title">
          {isSignup
            ? "Create Account"
            : "Welcome Back"}
        </h1>

        <p className="subtitle">
          {isSignup
            ? "Start your interview preparation"
            : "Sign in to continue"}
        </p>

        {isSignup && (
          <input
            type="text"
            name="username"
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
        )}

        <input
          type="email"
          name="email"
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          className="input"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          onKeyDown={(e) =>
            e.key === "Enter" && handleSubmit()
          }
        />

        {error && (
          <div className="errorBox">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <button
          className="authBtn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading
            ? "Please wait..."
            : isSignup
            ? "Create Account"
            : "Sign In"}
        </button>

        <p className="switchText">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <span onClick={switchMode}>
            {isSignup ? " Sign In" : " Sign Up"}
          </span>
        </p>

      </div>

    </div>
  );
}

export default Auth;