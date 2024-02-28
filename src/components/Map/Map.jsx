import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import style from "./Map.module.css";

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCi3tUbZSYeHIRuqRk1K545Q_M-TWSNKxk",
    language: "uk",
  });

  const containerStyle = {
    width: "800px",
    height: "695px",
  };

  const mapRef = React.useRef(undefined);

  const onLoad = React.useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    mapRef.current = undefined;
  }, []);
  return (
    <div width="100%">
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
          {/* Child components, such as markers, info windows, etc. */}
          <></>
        </GoogleMap>
      ) : (
        <h3>Map not found</h3>
      )}
    </div>
  );
};

export default Map;
