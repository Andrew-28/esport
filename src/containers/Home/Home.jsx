import React, { useState, useEffect } from "react";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import { PlaceCard } from "../PlaceCard";
import style from "./Home.module.css";
import placesJson from "../../data/places.json";

const Home = () => {
  const [places, setPlaces] = useState(null);
  const [place, setPlace] = useState(null);
  const [selectedMarkers, setSelectedMarkers] = useState([]);

  useEffect(() => {
    // Завантажуємо дані про місця з JSON файлу
    setPlaces(placesJson);
  }, []);

  const handlePlace = (placeId) => {
    const place = places.find((pl) => pl.id === placeId);
    if (place) {
      setPlace(place);
    } else {
      setPlace(null);
    }
  };

  const handleMarkers = (markers) => {
    setSelectedMarkers(markers);
  };

  return (
    <div className={style.contentContainer}>
      <div className={style.sidebar}>
        <SideBar selectMarkers={handleMarkers} />
      </div>
      <div
        className={`${style["map-container"]} ${
          place ? style["map-collapsed"] : ""
        }`}
      >
        <Map onDataRecieve={handlePlace} selectedMarkers={selectedMarkers} />
      </div>
      <div
        className={`${style["place-card-container"]} ${
          place ? style["visible"] : ""
        }`}
      >
        {place && <PlaceCard place={place} />}
      </div>
    </div>
  );
};

export default Home;
