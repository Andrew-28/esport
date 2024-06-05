import React from "react";
import "./PhotoGrid.css";

const PhotoGrid = ({ photos }) => {
  return (
    <div className="photo-grid">
      <div className="main-photo">
        <img src={photos[0]} alt="main" />
      </div>
      <div className="sub-photos">
        {photos.slice(1).map((photo, index) => (
          <div key={index} className="sub-photo">
            <img src={photo} alt={`sub-${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
