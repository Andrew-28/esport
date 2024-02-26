import React from "react";
import styles from "./SideBar.module.css";
import { Tree } from "../../components/Tree";
import { AutocompleteCP } from "../../components/Autocomplete";

const jsonData = require("../../data/sports.data.json");

const individualSports = jsonData["Kinds of sports"].Individual;
const teamSport = jsonData["Kinds of sports"].Team;

const allSports = individualSports.concat(teamSport);

const SideBar = () => {
  return (
    <div className={styles.sideBar}>
      <AutocompleteCP data={allSports} />
      <div className={styles.tree}>
        <Tree individual={individualSports} team={teamSport} />
      </div>
    </div>
  );
};

export default SideBar;
