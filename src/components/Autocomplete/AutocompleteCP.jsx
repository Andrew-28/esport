import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import "./Autocomplete.css";

function transformData(data) {
  if (!data) return [];
  const transformedData = [];
  for (let i = 0; i < data.length; i++) {
    const { Name, Subspecies } = data[i];

    for (const subspecies of Subspecies) {
      transformedData.push({
        label: subspecies,
        group: Name,
      });
    }
  }

  return transformedData;
}

const AutocompleteCP = ({ data, onSportSelect }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(transformData(data));
  }, [data]);

  return (
    <div className="autocomplete-shell">
      <Autocomplete
        className="autocomplete"
        disablePortal
        id="sport-autocomplete"
        options={options}
        groupBy={(option) => option.group}
        fullWidth
        size="small"
        onChange={(event, value) => {
          if (value && onSportSelect) {
            onSportSelect(value.label);
          }
        }}
        slotProps={{
          paper: { className: "autocomplete-paper" },
          popper: { className: "autocomplete-popper" },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Знайти вид спорту…"
            variant="outlined"
            margin="none"
            InputLabelProps={{
              shrink: false,
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchIcon className="autocomplete-icon" fontSize="small" />
              ),
            }}
          />
        )}
      />
    </div>
  );
};

export default AutocompleteCP;
