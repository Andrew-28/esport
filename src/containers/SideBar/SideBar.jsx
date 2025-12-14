import React, { useEffect, useState } from "react";
import styles from "./SideBar.module.css";
import { Tree } from "../../components/Tree";
import { AutocompleteCP } from "../../components/Autocomplete";
import { API_BASE_URL } from "../../config/apiConfig";

const SideBar = ({ onSportSelect }) => {
  const [sportsTreeData, setSportsTreeData] = useState(null);
  const [allSports, setAllSports] = useState([]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch(`${ API_BASE_URL}/api/sports`);
        if (!res.ok) {
          throw new Error("Помилка завантаження видів спорту");
        }
        const data = await res.json();
        const kinds = data["Kinds of sports"] || {};

        setSportsTreeData(kinds);

        const individual = kinds["Індивідуальні"] || [];
        const team = kinds["Командні"] || [];
        setAllSports(individual.concat(team));
      } catch (err) {
        console.error(err);
      }
    };

    fetchSports();
  }, []);

  const handleSport = (sportName) => {
    if (onSportSelect) {
      onSportSelect(sportName);
    }
  };

  return (
    <aside className={styles.sideBar}>
      {/* загальний хедер блоку */}
      <div className={styles.sideBarHeader}>
        <h2 className={styles.sideBarTitle}>Каталог видів спорту</h2>
        <p className={styles.sideBarSubtitle}>
          Оберіть категорію або введіть назву, щоб відфільтрувати локації на
          мапі.
        </p>
      </div>

      {/* пошук по видах спорту — той самий компонент, що й раніше */}
      <div className={styles.searchRow}>
        <AutocompleteCP data={allSports} onSportSelect={handleSport} />
      </div>

      {/* сам каталог (новий Tree з чіпами) */}
      <div className={styles.treeOuter}>
        <Tree data={sportsTreeData} onDataRecieve={handleSport} />
      </div>
    </aside>
  );
};

export default SideBar;
