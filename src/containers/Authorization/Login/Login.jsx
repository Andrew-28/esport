import React, { useState } from "react";
import style from "./Login.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Navigation/AuthContext";

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

    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("Вхід успішний:", data);
          localStorage.setItem('token', data.token); // Сохранение токена в локальном хранилище
          login();
          navigate("/"); // Перенаправление на главную страницу
        } else {
          setServerError(data.msg || "Помилка входу");
          console.error("Помилка входу:", data);
        }
      } catch (error) {
        setServerError("Помилка сервера");
        console.error("Помилка сервера:", error);
      }
    } else {
      console.log("У формі є помилки. Не вдалося відправити");
    }
  };

  return (
    <div className={style.container}>
      <img
        className={style.leftImage}
        src="../img/soccer.png"
        alt="Левое изображение"
      />

      <h1 className={style.formTitle}>Вхід</h1>
      <div className={style.loginForm}>
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
          {serverError && <p className={style.errorMessage}>{serverError}</p>}
          <div className={style.btnContainer}>
            <button className={style.btn} type="submit">
              Війти
            </button>
          </div>
        </form>
      </div>
      <p className={style.registerLink}>
        <Link to="/registration">Зареєструватись</Link>
      </p>

      <img
        className={style.rightImage}
        src="../img/volleyboll.png"
        alt="Правое изображение"
      />
    </div>
  );
};

export default Login;
