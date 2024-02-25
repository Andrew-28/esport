import React from "react";
import styles from "./SideBar.module.css";
import { Tree } from "../../components/Tree";

const SideBar = () => {
  return (
    <div className={styles.sideBar}>
      <Tree />
    </div>
  );
};

export default SideBar;
