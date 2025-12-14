import React, { useState } from "react";
import style from "./Registration.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Navigation/AuthContext";
import { API_BASE_URL } from "../../../config/apiConfig";

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const isEmailValid = () => email.includes("@");
  const isPasswordValid = () => password.length >= 8;

  const handleRegistration = async () => {
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Будь ласка, заповніть усі поля");
    } else if (!isEmailValid()) {
      setError("Будь ласка, введіть правильну адресу електронної пошти");
    } else if (!isPasswordValid()) {
      setError("Пароль повинен містити щонайменше 8 символів");
    } else if (password !== confirmPassword) {
      setError("Паролі не співпадають");
    } else {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSuccess("Реєстрація успішна");
          login(data.token, data.user);
          navigate("/");
        } else {
          if (data.msg) {
            setError(data.msg);
          } else if (data.errors && data.errors.length > 0) {
            setError(data.errors[0].msg);
          } else {
            setError("Помилка реєстрації");
          }
        }
      } catch (error) {
        console.error("Помилка сервера:", error);
        setError("Помилка сервера");
      }
    }
  };

  return (
    <div className={style.registrationFormContainer}>
      <img
        className={style.leftImage}
        src="../img/soccer.png"
        alt="Ліве зображення"
      />

      <div className={style.registrationForm}>
        <h2 className={style.formTitle}>Реєстрація</h2>
        <form className={style.formContainer}>
          <div className={style.inputGroup}>
            <label>Ім&apos;я:</label>
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
        alt="Праве зображення"
      />
    </div>
  );
};

export default Registration;
