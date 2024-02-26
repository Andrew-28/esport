import React from "react";
import { NavLink } from "react-router-dom";
import style from "./Navigation.module.css";
import { Footer } from "../Footer";

const Navigation = () => {
  return (
    <nav className={style.navigation}>
      <div className={style.title}>єСпорт</div>
      <div className={style.links}>
        <NavLink
          // onClick={scrollToFooter}
          to="/footer"
          className={({ isActive }) =>
            isActive ? style.selected : style.unselected
          }
        >
          Про нас
        </NavLink>
        <NavLink
          to="/imageToText"
          className={({ isActive }) =>
            isActive ? style.selected : style.unselected
          }
        >
          Авторизуватися
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
