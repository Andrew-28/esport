import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { PlaceCard } from "../../containers/PlaceCard";
import style from "./Map.module.css";
import markersJson from "../../data/markers.json"; // Імпортуйте JSON файл з даними про місця

const Map = ({ onDataRecieve, selectedMarkers }) => {
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

  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (selectedMarkers) {
      setMarkers(selectedMarkers);
    } else {
      setMarkers(markersJson);
    }
    // Завантажуємо дані про місця з JSON файлу
  }, [selectedMarkers]);

  const handleMarkerClick = (placeId) => {
    onDataRecieve(placeId);
  };

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
          {markers.map((place, index) => (
            <MarkerF
              key={index}
              position={{ lat: place.lat, lng: place.lng }}
              title={place.title}
              onClick={() => handleMarkerClick(place.placeId)} // Змінено тут
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
