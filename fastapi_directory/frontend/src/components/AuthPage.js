import React, { useState } from "react";
import axios from "axios";

function AuthPage({ onLoginSuccess, onContinueAsGuest }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Login request
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || '/api'}/auth/token`, 
        new URLSearchParams({ username, password }), 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const token = response.data.access_token;
      localStorage.setItem("access_token", token);
      onLoginSuccess(token);
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при входе");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Вход</h2>
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
          autoComplete="current-password"
        />
        <button type="submit" style={styles.button}>
          Войти
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
    backgroundColor: "#2a2f4a",
    border: "1px solid #f2a365",
    boxShadow: "0 4px 12px rgba(242, 163, 101, 0.4)",
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 24,
    color: "#f2a365",
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
    border: "1px solid #84a59d",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    backgroundColor: "#1b1f33",
    color: "#eaeaea",
    boxShadow: "inset 0 0 5px rgba(132, 165, 157, 0.5)",
  },
  button: {
    padding: 14,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "none",
    backgroundColor: "#f2a365",
    color: "#2a2f4a",
    fontWeight: "700",
    transition: "background-color 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(242, 163, 101, 0.6)",
  },
  guestButton: {
    marginTop: 20,
    padding: 14,
    fontSize: 18,
    cursor: "pointer",
    borderRadius: 8,
    border: "1px solid #f2a365",
    backgroundColor: "#2a2f4a",
    color: "#f2a365",
    fontWeight: "700",
    transition: "background-color 0.3s, box-shadow 0.3s",
    boxShadow: "0 4px 8px rgba(242, 163, 101, 0.6)",
  },
  error: {
    marginTop: 10,
    color: "#ff6b6b",
    fontWeight: "700",
  },
};

export default AuthPage;