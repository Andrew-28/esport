import React from "react";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import style from "./Home.module.css";

const Home = () => {
  return (
    <div className={style.contentContainer}>
      <div>
        <SideBar />
      </div>
      <Map />
    </div>
  );
};

export default Home;
