import React from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const Map = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCi3tUbZSYeHIRuqRk1K545Q_M-TWSNKxk",
  });

  const containerStyle = {
    width: "800px",
    height: "685px",
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
            lat: -3.745,
            lng: -38.523,
          }}
          zoom={10}
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
