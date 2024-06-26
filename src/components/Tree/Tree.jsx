import React, { useEffect, useState } from "react";
import styles from "./Tree.module.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import sportJson from "../../data/sports.data.json";

const Tree = ({ onDataRecieve }) => {
  const [data, setData] = useState({});
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    // Загрузка данных из JSON файла
    setData(sportJson["Kinds of sports"]);
  }, []);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
    const selectedNodeId = nodeIds[nodeIds.length - 1];
    const nodeName = getNodeNameById(data, selectedNodeId);
    if (nodeName) {
      onDataRecieve(nodeName);
    }
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) => {
      if (oldExpanded.length === 0) {
        // Collect all nodeIds to expand
        const allNodeIds = [];
        Object.keys(data).forEach((key) => {
          allNodeIds.push(key);
          data[key].forEach((item) => {
            const nodeId = `${key}-${item.Name}`;
            allNodeIds.push(nodeId);
            if (item.Subspecies.length > 0) {
              item.Subspecies.forEach((sub) => {
                allNodeIds.push(`${nodeId}-${sub}`);
              });
            }
          });
        });
        return allNodeIds;
      } else {
        return [];
      }
    });
  };

  const getNodeNameById = (data, nodeId) => {
    for (let key of Object.keys(data)) {
      for (let el of data[key]) {
        for (let sub of el.Subspecies) {
          if (`${key}-${el.Name}-${sub}` === nodeId) {
            return sub;
          }
        }
        if (`${key}-${el.Name}` === nodeId && el.Subspecies.length === 0) {
          return el.Name;
        }
      }
    }
    return null;
  };

  const renderTree = (data) => {
    return Object.keys(data).map((key) => (
      <TreeItem id={key} key={key} nodeId={key} label={key}>
        {data[key].map((el) => {
          const nodeId = `${key}-${el.Name}`;
          return (
            <TreeItem id={nodeId} key={nodeId} nodeId={nodeId} label={el.Name}>
              {el.Subspecies.length > 0
                ? el.Subspecies.map((sub) => (
                    <TreeItem
                      id={`${nodeId}-${sub}`}
                      key={`${nodeId}-${sub}`}
                      nodeId={`${nodeId}-${sub}`}
                      label={sub}
                    />
                  ))
                : null}
            </TreeItem>
          );
        })}
      </TreeItem>
    ));
  };

  return (
    <Box
      className={styles.tree}
      sx={{ minHeight: 270, flexGrow: 1, maxWidth: 350 }}
    >
      <Box sx={{ mb: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? "Розгорнути все" : "Згорнути все"}
        </Button>
      </Box>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={expanded}
        selected={selected}
        onNodeToggle={handleToggle}
        onNodeSelect={handleSelect}
        multiSelect
      >
        {renderTree(data)}
      </TreeView>
    </Box>
  );
};

export default Tree;
