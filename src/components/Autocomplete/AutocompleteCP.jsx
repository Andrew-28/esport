import React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import "./Autocomplete.css";


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
      className="autocomplete"
      disablePortal
      id="combo-box-demo"
      options={arr}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          {...params}
          // hiddenLabel
          label="Обрати вид спорту"
          margin="dense"
          variant="outlined"
          sx={{ color: "white" }}
          InputLabelProps={{ className: "textfieldLabel" }}
        />
      )}
    />
  );
};

export default AutocompleteCP;
