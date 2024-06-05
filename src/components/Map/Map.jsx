import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import style from "./Map.module.css";
import placesData from "../../data/places.json"; // Імпортуйте JSON файл з даними про місця

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCOHvFqK3NFtGfKv_KM3lJKdop8YzJkLXs",
    language: "uk",
  });

  const containerStyle = {
    width: "100%",
    height: "100%",
  };

  const mapRef = React.useRef(undefined);

  const onLoad = React.useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    mapRef.current = undefined;
  }, []);

  const [places, setPlaces] = useState([]);

  const showPlaceCard = (id) => {
    // console.log(places.find((place) => (place.id = id)));
    console.log(id);
  };

  useEffect(() => {
    // Завантажуємо дані про місця з JSON файлу
    setPlaces(placesData);
  }, []);

  return (
    <div className={style.mapContainer}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{
            lat: 48.46718868150143,
            lng: 35.03321609792512,
          }}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {places.map((place, index) => (
            <MarkerF
              key={index}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.title}
              onClick={showPlaceCard(place.id)}
            />
          ))}
        </GoogleMap>
      ) : (
        <h3>Map not found</h3>
      )}
    </div>
  );
};

export default Map;
