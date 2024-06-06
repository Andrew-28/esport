import React, { useState, useEffect } from "react";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import { PlaceCard } from "../PlaceCard";
import style from "./Home.module.css";
import placesJson from "../../data/places.json";

const Home = () => {
  const [places, setPlaces] = useState(null);

  useEffect(() => {
    // Завантажуємо дані про місця з JSON файлу
    setPlaces(placesJson);
  }, []);

  const [place, setPlace] = useState(null);

  const [selectedMarkers, setSelectedMarkers] = useState([]);

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
      <div>
        <SideBar selectMarkers={handleMarkers} />
      </div>
      <Map onDataRecieve={handlePlace} selectedMarkers={selectedMarkers} />
      {place ? (
        <div>
          <PlaceCard place={place} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Home;
