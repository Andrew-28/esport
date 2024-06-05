import React from "react";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import { PlaceCard } from "../PlaceCard";
import style from "./Home.module.css";

const Home = () => {
  return (
    <div className={style.contentContainer}>
      <div>
        <SideBar />
      </div>
      <Map />
      {/* <div>
        <PlaceCard  />
      </div> */}
    </div>
  );
};

export default Home;
