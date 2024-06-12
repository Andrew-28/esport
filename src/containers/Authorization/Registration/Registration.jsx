import React, { useState } from "react";
import style from "./Registration.module.css";
import { Link, useNavigate } from "react-router-dom";

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const isEmailValid = () => {
    return email.includes("@");
  };

  const isPasswordValid = () => {
    return password.length >= 4;
  };

  const handleRegistration = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Будь ласка, заповніть усі поля");
    } else if (!isEmailValid()) {
      setError("Будь ласка, введіть правильну адресу електронної пошти");
    } else if (!isPasswordValid()) {
      setError("Пароль повинен містити щонайменше 8 символів");
    } else if (password !== confirmPassword) {
      setError("Паролі не співпадають");
    } else {
      setError("");
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          setSuccess("Реєстрація успішна");
          console.log("Реєстрація успішна:", data);
          navigate("/"); // Перенаправление на главную страницу
        } else {
          setError(data.msg || "Помилка реєстрації");
          console.error("Помилка реєстрації:", data);
        }
      } catch (error) {
        setError("Помилка сервера");
        console.error("Помилка сервера:", error);
      }
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
            <label>Ім'я:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            {success && <p className={style.successMessage}>{success}</p>}
          </div>

          <button
            className={style.btn}
            type="button"
            onClick={handleRegistration}
          >
            Зареєструватись
          </button>
        </form>

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
