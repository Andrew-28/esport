import React from "react";
import { Link, animateScroll } from "react-scroll";
import style from "./Navigation.module.css";
import { Footer } from "../Footer";

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
        <Link to="/imageToText" className={style.btn}>
          Авторизуватися
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
