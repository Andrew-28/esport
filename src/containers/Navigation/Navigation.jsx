import React from "react";
import style from "./Navigation.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAnchorClick = (event, anchorId) => {
    event.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Удаление токена из локального хранилища
    logout();
    navigate('/');
  };

  return (
    <nav className={style.navigation}>
      <Link to="/" className={style.title}>
        єСпорт
      </Link>
      <div className={style.btnGroup}>
        <a
          onClick={(e) => handleAnchorClick(e, "footer")}
          className={style.btn}
          href="#footer"
        >
          Про нас
        </a>
        {isAuthenticated ? (
          <button onClick={handleLogout} className={style.btn}>
            Вийти з системи
          </button>
        ) : (
          <Link to="/login" className={style.btn}>
            Авторизуватися
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
