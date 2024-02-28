import React from "react";
import { animateScroll } from "react-scroll";
import style from "./Navigation.module.css";
import { Footer } from "../Footer";
import { Route, Routes, Link } from "react-router-dom";
import { Login } from "../Authorization/Login";

const Navigation = () => {
  
  const handleAnchorClick = (event, anchorId) => {
    event.preventDefault();

    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
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
        <Link to="/login" className={style.btn}>
          Авторизуватися
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
