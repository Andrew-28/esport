import React, { useState } from "react";
import ReactDOM from "react-dom";
import style from "./Registration.module.css";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isEmailValid = () => {
    return email.includes("@");
  };

  const isPasswordValid = () => {
    return password.length >= 8;
  };

  const handleRegistration = () => {
    if (!email || !password || !confirmPassword) {
      setError("Будь ласка, заповніть усі поля");
    } else if (!isEmailValid()) {
      setError("Будь ласка, введіть правильну адресу електронної пошти");
    } else if (!isPasswordValid()) {
      setError("Пароль повинен містити щонайменше 8 символів");
    } else if (password !== confirmPassword) {
      setError("Паролі не співпадають");
    } else {
      setError("");
      console.log("Реєстрація:", { email, password });
    }
  };

  return (
    <div className={style.registrationFormContainer}>
      <img
        className={style.leftImage}
        src="../img/running.jpg"
        alt="Левое изображение"
      />

      <div className={style.registrationForm}>
        <h2>Реєстрація</h2>
        <form>
          <label>E-mail:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Повторіть пароль:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <p className="errorMessage">{error}</p>}

          <button
            className={style.btn}
            type="button"
            onClick={handleRegistration}
          >
            Зареєструватись
          </button>
        </form>

        <button
          className={style.btn}
          onClick={() => console.log("Повернення до форми входу")}
        >
          Форма входа
        </button>
      </div>
      <img
        className={style.rightImage}
        src="../img/basket-ball.jpg"
        alt="Правое изображение"
      />
    </div>
  );
};

export default Registration;
