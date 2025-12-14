// src/components/PlaceInfo/PlaceInfo.jsx
import React from "react";
import "./PlaceInfo.css";

const PlaceInfo = ({ name, description }) => {
  return (
    <div className="place-info">
      <h2>{name}</h2>
      {Array.isArray(description) &&
        description
          .filter(Boolean) // прибираємо null/undefined/порожні рядки
          .map((el, idx) => (
            <p key={idx}>{el}</p>
          ))}
    </div>
  );
};

export default PlaceInfo;
