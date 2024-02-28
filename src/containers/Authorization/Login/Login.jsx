import React, { useState } from "react";
import ReactDOM from "react-dom";
import style from "./Login.module.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Ваша логика отправки данных на сервер
      console.log("Email:", email);
      console.log("Password:", password);
    } else {
      console.log("Форма содержит ошибки. Не удалось отправить.");
    }
  };

  return (
    <div className={style.container}>
      <img
        className={style.leftImage}
        src="../img/running.jpg"
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
          <div className={style.btnContainer}>
            <button className={style.btn} type="submit">
              Війти
            </button>
          </div>
        </form>
      </div>
      <p className={style.registerLink}>
        <Link to="/registration" >Зареєструватись</Link>
      </p>

      <img
        className={style.rightImage}
        src="../img/basket-ball.jpg"
        alt="Правое изображение"
      />
    </div>
  );
};

export default Login;
// const rootElement = document.getElementById("root");
// ReactDOM.render(<Login id="Login" />, rootElement);
