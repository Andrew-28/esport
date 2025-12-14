import React from "react";
import "./Rating.css";

const Rating = ({ rating, onChange, disabled }) => {
  const handleClick = (index) => {
    if (disabled || !onChange) return;
    onChange(index + 1); // 1..5
  };

  const stars = Array(5)
    .fill(0)
    .map((_, index) => (
      <span
        key={index}
        className={index < rating ? "star filled" : "star"}
        onClick={() => handleClick(index)}
        style={{
          cursor: onChange && !disabled ? "pointer" : "default",
        }}
      >
        &#9733;
      </span>
    ));

  return <div className="rating">{stars}</div>;
};

export default Rating;
