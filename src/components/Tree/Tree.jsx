import React, { useEffect, useState } from "react";
import styles from "./Tree.module.css";

const Tree = ({ onDataRecieve, data }) => {
  const [treeData, setTreeData] = useState({});
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setTreeData(data);
      // за замовчуванням відкриваємо першу категорію
      const firstCat = Object.keys(data)[0];
      setOpenCategory(firstCat || null);
    }
  }, [data]);

  const handleToggleCategory = (category) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  const handleChipClick = (category, groupName, label) => {
    const key = `${category}-${groupName}-${label}`;
    setSelectedKey(key);
    if (onDataRecieve) {
      onDataRecieve(label); // label = підвид або назва виду спорту
    }
  };

  if (!treeData || Object.keys(treeData).length === 0) {
    return (
      <div className={styles.treeWrapper}>
        <div className={styles.treeHeader}>
          <span className={styles.treeHeaderLabel}>Види спорту</span>
        </div>
        <div className={styles.treeBodyMuted}>Завантаження...</div>
      </div>
    );
  }

  return (
    <div className={styles.treeWrapper}>
      <div className={styles.treeHeader}>
        <span className={styles.treeHeaderLabel}>Каталог видів спорту</span>
      </div>

      <div className={styles.treeBody}>
        {Object.keys(treeData).map((category) => (
          <div key={category} className={styles.categoryBlock}>
            <button
              type="button"
              className={`${styles.categoryButton} ${
                openCategory === category ? styles.categoryButtonOpen : ""
              }`}
              onClick={() => handleToggleCategory(category)}
            >
              <span>{category}</span>
              <span className={styles.chevron}>
                {openCategory === category ? "−" : "+"}
              </span>
            </button>

            {openCategory === category && (
              <div className={styles.categoryContent}>
                {treeData[category].map((item) => {
                  const hasSub =
                    Array.isArray(item.Subspecies) &&
                    item.Subspecies.length > 0;

                  // якщо підвидів нема – робимо один чіп з назвою виду спорту
                  const chips = hasSub ? item.Subspecies : [item.Name];

                  return (
                    <div key={item.Name} className={styles.sportGroup}>
                      {hasSub && (
                        <button
                          type="button"
                          className={styles.sportName}
                          disabled
                        >
                          {item.Name}
                        </button>
                      )}

                      <div className={styles.subspeciesRow}>
                        {chips.map((sub) => {
                          const label = hasSub ? sub : item.Name;
                          const chipKey = `${category}-${item.Name}-${label}`;
                          const isActive = selectedKey === chipKey;

                          return (
                            <button
                              key={chipKey}
                              type="button"
                              className={`${styles.chip} ${
                                isActive ? styles.chipActive : ""
                              }`}
                              onClick={() =>
                                handleChipClick(category, item.Name, label)
                              }
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tree;
