import React from "react";
import { Link, animateScroll } from "react-scroll";
import style from "./Navigation.module.css";
import { Footer } from "../Footer";
import { Route, Routes } from "react-router-dom";
import { Login } from "../Authorization/Login";

const Navigation = () => {
  return (
    <nav className={style.navigation}>
      <div className={style.title}>єСпорт</div>
      <div className={style.btnGroup}>
        <Link
          className={style.btn}
          to="footer"
          spy={true}
          smooth={true}
          duration={600}
        >
          Про нас
        </Link>
        <Link to="/login" className={style.btn}>
          Авторизуватися
        </Link>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </nav>
  );
};

export default Navigation;
