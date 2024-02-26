import React from "react";
import { Link } from "react-router-dom";
import style from "./Navigation.module.css";
import { Footer } from "../Footer";

const Navigation = () => {
  return (
    <nav className={style.navigation}>
      <div className={style.title}>єСпорт</div>
      <div className={style.links}>
        <Link
          to="/footer"
          className={style.unselected}
        >
          Про нас
        </Link>
        <Link to="/imageToText" className={style.unselected}>
          Авторизуватися
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
