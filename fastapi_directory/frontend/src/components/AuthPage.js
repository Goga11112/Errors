import React, { useState } from "react";
import axios from "axios";

function AuthPage({ onLoginSuccess, onContinueAsGuest }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const toggleMode = () => {
    setError(null);
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        // Login request
        const response = await axios.post(`http://localhost:8000/api/auth/token`, new URLSearchParams({
          username,
          password,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        const token = response.data.access_token;
        localStorage.setItem("access_token", token);
        onLoginSuccess(token);
      } else {
        // Registration request
        await axios.post(`http://localhost:8000/api/auth/register`, {
          username,
          password,
        });
        setIsLogin(true);
        setError("Регистрация успешна. Пожалуйста, войдите.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при запросе");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isLogin ? "Вход" : "Регистрация"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          id="username"
          type="text"
          placeholder="Введите имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
          autoComplete="username"
        />
        <input
          id="password"
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      <button type="submit" style={styles.button}>
        {isLogin ? "Войти" : "Зарегистрироваться"}
      </button>
      <button onClick={toggleMode} style={styles.registrationButton}>
        {isLogin ? "Регистрация" : "Уже есть аккаунт? Войти"}
      </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
      <button onClick={onContinueAsGuest} style={styles.guestButton}>
        Продолжить без авторизации
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "50px auto",
    padding: 30,
    borderRadius: 10,
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#2a2f4a", // dark blue background (triad color 1)
    border: "1px solid #f2a365", // orange border (triad color 2)
    boxShadow: "0 4px 12px rgba(242, 163, 101, 0.4)", // orange shadow
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 24,
    color: "#f2a365", // orange (triad color 2)
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 15,
  },
  input: {
    padding: 14,
    fontSize: 18,
    borderRadius: 8,
    border: "1px solid #84a59d", // greenish border (triad color 3)
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    backgroundColor: "#1b1f33", // darker blue background for inputs
    color: "#eaeaea", // light text
    boxShadow: "inset 0 0 5px rgba(132, 165, 157, 0.5)",
  },
  inputFocus: {
    borderColor: "#f2a365",
    boxShadow: "0 0 8px #f2a365",
  },
  button: {
    padding: 14,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#f2a365", // orange button
    color: "#2a2f4a", // dark blue text
    fontWeight: "700",
    transition: "background-color 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(242, 163, 101, 0.6)",
  },
  buttonHover: {
    backgroundColor: "#d18c4a",
    boxShadow: "0 6px 12px rgba(209, 140, 74, 0.8)",
  },
  registrationButton: {
    marginTop: 20,
    padding: 14,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid #f2a365", // orange border
    backgroundColor: "#2a2f4a", // dark blue background
    color: "#f2a365", // orange text
    fontWeight: "700",
    transition: "background-color 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(242, 163, 101, 0.6)",
  },
  registrationButtonHover: {
    backgroundColor: "#3b4160",
    boxShadow: "0 6px 12px rgba(242, 163, 101, 0.8)",
  },
  guestButton: {
    marginTop: 20,
    padding: 14,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid #f2a365", // orange border
    backgroundColor: "#2a2f4a", // dark blue background
    color: "#f2a365", // orange text
    fontWeight: "700",
    transition: "background-color 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(242, 163, 101, 0.6)",
  },
  guestButtonHover: {
    backgroundColor: "#3b4160",
    boxShadow: "0 6px 12px rgba(242, 163, 101, 0.8)",
  },
  error: {
    marginTop: 10,
    color: "#ff6b6b", // softer red
    fontWeight: "700",
  },
  "@keyframes gradientShift": {
    "0%": {
      backgroundPosition: "0% 50%",
    },
    "50%": {
      backgroundPosition: "100% 50%",
    },
    "100%": {
      backgroundPosition: "0% 50%",
    },
  }
};

export default AuthPage;
