import React from "react";
import "./PlaceInfo.css";

const PlaceInfo = ({ name, description }) => {
  return (
    <div className="place-info">
      <h2>{name}</h2>
      <p>{description}</p>
    </div>
  );
};

export default PlaceInfo;
