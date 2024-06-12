import React, { useState, useEffect } from "react";
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
  const [isFocused, setIsFocused] = useState(true);
  const arr = transformData(data);

  useEffect(() => {
    // Фокусування при завантаженні компонента
    const timer = setTimeout(() => {
      setIsFocused(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Autocomplete
      className="autocomplete"
      disablePortal
      id="combo-box-demo"
      options={arr}
      sx={{ width: 250 }}
      renderInput={(params) => (
        <TextField
          // inputRef={(input) => input && input.focus()} ИЗБАВЛЯЕМСЯ ОТ ЭТОГО
          {...params}
          label="Знайти вид спорту"
          margin="dense"
          variant="outlined"
          sx={{ color: "white" }}
          InputLabelProps={{
            className: `textfieldLabel`,
          }}
          // onFocus={() => setIsFocused(true)}
          // onBlur={() => setIsFocused(false)}
        />
      )}
    />
  );
};

export default AutocompleteCP;
