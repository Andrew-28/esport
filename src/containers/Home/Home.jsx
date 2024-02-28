import React from "react";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import { Places } from "../../components/Places";
import style from "./Home.module.css";

const Home = () => {
  return (
    <div className={style.contentContainer}>
      <div>
        <SideBar />
      </div>
      <Map />
      <div>
        <Places />
      </div>
    </div>
  );
};

export default Home;
