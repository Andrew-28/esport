import React from "react";
// import styles from "./Tree.module.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

export default function Tree() {
  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState([]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) =>
      oldExpanded.length === 0 ? ["1", "5", "6", "7", "9"] : []
    );
  };

  const handleSelectClick = () => {
    setSelected((oldSelected) =>
      oldSelected.length === 0
        ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
        : []
    );
  };

  return (
    <Box sx={{ minHeight: 270, flexGrow: 1, maxWidth: 300 }}>
      <Box sx={{ mb: 1 }}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? "Розгорнути все" : "Згорнути все"}
        </Button>
        {/* <Button onClick={handleSelectClick}>
          {selected.length === 0 ? "Обрати все" : "Скасувати"}
        </Button> */}
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
        <TreeItem nodeId="1" label="Індивідуальні">
          <TreeItem nodeId="2" label="Плавання" />
          <TreeItem nodeId="3" label="Бокс" />
          <TreeItem nodeId="4" label="Фехтування" />
        </TreeItem>
        <TreeItem nodeId="5" label="Командні">
          <TreeItem nodeId="6" label="Волейбол">
            <TreeItem nodeId="7" label="Пляжний" />
            <TreeItem nodeId="8" label="Класичний" />
          </TreeItem>
          <TreeItem nodeId="9" label="Футбол">
            <TreeItem nodeId="10" label="Міні-футбол" />
            <TreeItem nodeId="11" label="Класичний футбол" />
          </TreeItem>
        </TreeItem>
      </TreeView>
    </Box>
  );
}
