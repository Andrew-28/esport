import React, { useState, useEffect } from "react";
import styles from "./SideBar.module.css";
import { Tree } from "../../components/Tree";
import { AutocompleteCP } from "../../components/Autocomplete";
import markersJson from "../../data/markers.json";

const jsonData = require("../../data/sports.data.json");

const individualSports = jsonData["Kinds of sports"].Індивідуальні;
const teamSport = jsonData["Kinds of sports"].Командні;

const allSports = individualSports.concat(teamSport);

const SideBar = ({ selectMarkers }) => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    // Завантажуємо дані про місця з JSON файлу
    setMarkers(markersJson);
  }, []);

  const handleSport = (sportName) => {
    const marker = markers.filter((m) => m.sportName === sportName);
    if (marker) {
      selectMarkers(marker);
    } else {
      selectMarkers(null);
    }
  };

  return (
    <div className={styles.sideBar}>
      <AutocompleteCP data={allSports} />
      <div className={styles.tree}>
        <Tree onDataRecieve={handleSport} />
      </div>
    </div>
  );
};

export default SideBar;
