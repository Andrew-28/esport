import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";
import { defaultOptions, containerStyle } from "./defaultOptions";

export const MODES = {
  MOVE: 0,
  SET_MARKER: 1,
};

//   interface Props {
//     center: Coordinates;
//     mode: Mode | number;
//     markers: Coordinates[];
//     onMarkerAdd: (coordinates: Coordinates) => void;
//     pathById: string | undefined;
//   }

const Map = ({ center, mode, markers, onMarkerAdd, pathById }) => {
  const [map, setMap] = useState(null);
  const mapRef = useRef(undefined);
  const [directions, setDirections] = useState(null);
  const [point, setPoint] = useState([]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback((map) => {
    mapRef.current = undefined;
  }, []);

  const onClick = useCallback(
    (loc) => {
      if (mode === MODES.SET_MARKER) {
        const latLng = loc.latLng;
        if (latLng !== null) {
          const lat = latLng.lat();
          const lng = latLng.lng();
          onMarkerAdd({ lat, lng });
        }
      }
    },
    [mode, onMarkerAdd]
  );

  const handleDirectionsService = (response) => {
    try {
      if (!response) {
        throw new Error("No response received");
      }

      const route = response.routes[0];

      let distance = 0;

      for (let i = 0; i < route.legs.length; i++) {
        const leg = route.legs[i];

        if (!leg.distance) {
          throw new Error("Distance not found for leg");
        }

        distance += leg.distance.value;
      }

      let range = "";

      if (distance > 1000) {
        range = `${distance / 1000} km`;
      } else {
        range = `${distance} m`;
      }

      setDirections(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
        onClick={onClick}
      >
        {point.map((pos, index) => {
          return <Marker key={index} position={pos} />;
        })}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{ suppressMarkers: true }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;
