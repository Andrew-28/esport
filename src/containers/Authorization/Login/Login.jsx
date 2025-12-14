import React, { useState } from "react";
import style from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Navigation/AuthContext";
import { API_BASE_URL } from "../../../config/apiConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Введіть e-mail";
    }
    if (!password.trim()) {
      newErrors.password = "Введіть пароль";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        navigate("/");
      } else {
        if (data.msg) {
          setServerError(data.msg);
        } else if (data.errors && data.errors.length > 0) {
          setServerError(data.errors[0].msg);
        } else {
          setServerError("Помилка входу");
        }
      }
    } catch (error) {
      console.error("Помилка сервера:", error);
      setServerError("Помилка сервера");
    }
  };

  return (
    <div className={style.container}>
      <img
        className={style.leftImage}
        src="../img/soccer.png"
        alt="Ліве зображення"
      />


      <div className={style.loginForm}>
        <h1 className={style.formTitle}>Вхід</h1>
        <form onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label className={style.inputLabel} htmlFor="email">
              E-mail
            </label>
            <input
              className={style.inputField}
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className={style.errorMessage}>{errors.email}</p>
            )}
          </div>

          <div className={style.inputGroup}>
            <label className={style.inputLabel} htmlFor="password">
              Пароль
            </label>
            <input
              className={style.inputField}
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className={style.errorMessage}>{errors.password}</p>
            )}
          </div>

          {serverError && (
            <p className={style.errorMessage}>{serverError}</p>
          )}

          <div className={style.btnContainer}>
            <button className={style.btn} type="submit">
              Війти
            </button>
          </div>
        </form>
        <p className={style.registerLink}>
          <Link to="/registration">Зареєструватись</Link>
        </p>
      </div>



      <img
        className={style.rightImage}
        src="../img/volleyboll.png"
        alt="Праве зображення"
      />
    </div>
  );
};

export default Login;
