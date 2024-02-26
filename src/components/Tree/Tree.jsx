import React from "react";
import styles from "./Tree.module.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

const Tree = ({ individual, team }) => {
  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState([]);

  const handleToggle = (event, nodeIds) => {
    // setExpanded((prevExpanded) => [...new Set([...prevExpanded, ...nodeIds])]);
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

  const handleExpandClick = () => {
    setExpanded((oldExpanded) =>
      oldExpanded.length === 0
        ? ["1", "2", "3", "8", "14", "16", "18", "19", "22", "26"]
        : []
    );
  };

  let saveId = 1;

  const renderTree = (data, parentId = null) => {
    return data.map((el) => {
      const nodeId = `${parentId}-${el.Name}`;
      return (
        <TreeItem key={nodeId} nodeId={nodeId} label={el.Name}>
          {el.Subspecies.map((sub) => (
            <TreeItem
              key={`${nodeId}-${sub}`}
              nodeId={`${nodeId}-${sub}`}
              label={sub}
            />
          ))}
        </TreeItem>
      );
    });
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
        <TreeItem nodeId="1" label="Індивідуальні">
          {renderTree(individual)}
        </TreeItem>
        <TreeItem nodeId="18" label="Командні">
          {renderTree(team)}
        </TreeItem>
      </TreeView>
    </Box>
  );
};

export default Tree;
