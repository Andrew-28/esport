import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import style from "./Map.module.css";

// Фікс іконок Leaflet у CRA (щоб підвантажувалися marker-icon.png)
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const defaultCenter = {
  lat: 48.46718868150143,
  lng: 35.03321609792512,
};

const placeToMarker = (p) => ({
  lat: p.lat,
  lng: p.lng,
  title: p.name,
  placeId: p.id,
  sportName: p.sportName,
});

// Допоміжний компонент, щоб підстроїти bounds під обрані маркери
const FitBoundsOnMarkers = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [markers, map]);

  return null;
};

// Центрування на конкретному місці (для переходу з профілю)
const ActivePlaceView = ({ activePlaceId, places }) => {
  const map = useMap();

  useEffect(() => {
    if (!activePlaceId || !places || places.length === 0) return;
    const p = places.find((pl) => pl.id === activePlaceId);
    if (!p) return;
    map.setView([p.lat, p.lng], 14, { animate: true });
  }, [activePlaceId, places, map]);

  return null;
};

const Map = ({ places, onDataRecieve, selectedMarkers, activePlaceId }) => {
  const [center] = useState(defaultCenter);

  const markers = useMemo(() => {
    if (selectedMarkers && selectedMarkers.length > 0) {
      return selectedMarkers;
    }
    if (places && places.length > 0) {
      return places.map(placeToMarker);
    }
    return [];
  }, [selectedMarkers, places]);

  const handleMarkerClick = (placeId) => {
    if (onDataRecieve) {
      onDataRecieve(placeId);
    }
  };

  return (
    <div className={style.mapContainer}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Плитки OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Якщо є активне місце — центруємося на ньому */}
        {activePlaceId && places && (
          <ActivePlaceView activePlaceId={activePlaceId} places={places} />
        )}

        {/* Автоматичне підлаштування масштабу під маркери (коли є фільтр по виду спорту) */}
        {markers.length > 0 && <FitBoundsOnMarkers markers={markers} />}

        {/* Маркери місць */}
        {markers.map((place) => (
          <Marker
            key={place.placeId}
            position={[place.lat, place.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(place.placeId),
            }}
          >
            <Popup>
              <strong>{place.title}</strong>
              <br />
              {place.sportName || "Вид спорту не вказано"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
