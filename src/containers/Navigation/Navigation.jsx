import React from "react";
import { NavLink } from "react-router-dom";
import style from "./Navigation.module.css";

const Navigation = () => {
  return (
    <nav className={style.navigation}>
      <div className={style.title}>
        єСпорт
      </div>
      <div className={style.links}>
        <NavLink
          to="/ipLookup"
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
