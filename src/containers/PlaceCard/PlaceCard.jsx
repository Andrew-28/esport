import React from "react";
import { PhotoGrid } from "../../components/PhotoGrid";
import { PlaceInfo } from "../../components/PlaceInfo";
import { Rating } from "../../components/Rating";
import "./PlaceCard.css";

const PlaceCard = ({ place }) => {
  return (
    <div className="place-card">
      <PhotoGrid photos={place.photos} />
      <PlaceInfo name={place.name} description={place.description} />
      <Rating rating={place.rating} />
    </div>
  );
};

export default PlaceCard;
