import React, { useState } from "react";
import ReactDOM from "react-dom";
import style from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Введите email";
    }

    if (!password.trim()) {
      newErrors.password = "Введите пароль";
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
      <h1 className={style.formTitle}>Вход</h1>
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
          {errors.email && <p className={style.errorMessage}>{errors.email}</p>}
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
          <button className="btn" type="submit">
            Войти
          </button>
        </div>
      </form>
      <p className={style.registerLink}>
        <a href="#">Зарегистрироваться</a>
      </p>
    </div>
  );
};

export default Login;
// const rootElement = document.getElementById("root");
// ReactDOM.render(<Login id="Login" />, rootElement);
