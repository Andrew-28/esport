import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import styles from "./Autocomplete.module.css";

function transformData(data) {
  const transformedData = [];
  for (let i = 0; i < data.length; i++) {
    const { Name, Subspecies } = data[i];

    for (const subspecies of Subspecies) {
      transformedData.push({
        label: subspecies,
        year: Name,
      });
    }
  }

  return transformedData;
}

const AutocompleteCP = ({ data }) => {
  const arr = transformData(data);
  return (
    <Autocomplete
      className={styles.autocomplete}
      disablePortal
      id="combo-box-demo"
      options={arr}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          hiddenLabel
          margin="dense"
          label="Обрати вид спорту"
        />
      )}
    />
  );
};

export default AutocompleteCP;
