import React from "react";
import "./Rating.css";

const Rating = ({ rating }) => {
  const stars = Array(5)
    .fill(0)
    .map((_, index) => (
      <span key={index} className={index < rating ? "star filled" : "star"}>
        &#9733;
      </span>
    ));

  return <div className="rating">{stars}</div>;
};

export default Rating;
