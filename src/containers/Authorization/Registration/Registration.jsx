import React, { useState } from "react";
import style from "./Registration.module.css";
import { Link } from "react-router-dom";

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
        src="../img/soccer.png"
        alt="Левое изображение"
      />

      <div className={style.registrationForm}>
        <h2 className={style.formTitle}>Реєстрація</h2>
        <form className={style.formContainer}>
          <div className={style.inputGroup}>
            <label>E-mail:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={style.inputGroup}>
            <label>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={style.inputGroup}>
            <label>Повторіть пароль:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className={style.errorMessage}>{error}</p>}
          </div>

          <button
            className={style.btn}
            type="button"
            onClick={handleRegistration}
          >
            Зареєструватись
          </button>
        </form>

        {/* <div
          className={style.btnBack}
          onClick={() => console.log("Повернення до форми входу")}
        >
          Форма входу
        </div> */}
        <Link to="/login" className={style.btnBack}>
          Форма входу
        </Link>
      </div>
      <img
        className={style.rightImage}
        src="../img/volleyboll.png"
        alt="Правое изображение"
      />
    </div>
  );
};

export default Registration;
