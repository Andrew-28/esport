import React from "react";
import { Link, animateScroll } from "react-scroll";
import { Route, Routes } from "react-router-dom";
import style from "./Navigation.module.css";
import { Login } from "../Authorization/Login";

const Navigation = () => {
  return (
    <nav className={style.navigation}>
      <div className={style.title}>єСпорт</div>
      <div className={style.btnGroup}>
        {/* <Link to={"footer"} className={style.unselected}>
          Про нас
        </Link> */}
        <Link
          className={style.btn}
          // activeClass="active"
          to="footer"
          spy={true}
          smooth={true}
          // offset={70}
          duration={600}
        >
          Про нас
        </Link>
        <Link to="/Login" className={style.btn}>
          Авторизуватися
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
