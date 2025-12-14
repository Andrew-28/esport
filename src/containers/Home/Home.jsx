import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideBar } from "../SideBar";
import { Map } from "../../components/Map";
import { PlaceCard } from "../PlaceCard";
import style from "./Home.module.css";

const Home = () => {
  const [places, setPlaces] = useState(null);
  const [place, setPlace] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeSport, setActiveSport] = useState(null);
  const [activePlaceId, setActivePlaceId] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // завантаження місць з бекенду
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/places");
        if (!res.ok) {
          throw new Error("Помилка завантаження місць");
        }
        const data = await res.json();
        setPlaces(data);
      } catch (e) {
        console.error(e);
        setError("Не вдалося завантажити дані про місця");
      }
    };

    fetchPlaces();
  }, []);

  // читаємо place з query-параметра ?place=ID (наприклад, з переходу з профілю)
  useEffect(() => {
    if (!places) return;

    const params = new URLSearchParams(location.search);
    const placeParam = params.get("place");

    if (placeParam) {
      const placeId = Number(placeParam);
      const selected = places.find((pl) => pl.id === placeId);
      if (selected) {
        setActivePlaceId(placeId);
        setPlace(selected);
      }
    } else {
      setActivePlaceId(null);
      // за бажанням можна очищати place:
      // setPlace(null);
    }
  }, [location.search, places]);

  // обробка кліку по маркеру або іншому виборі місця
  const handlePlace = (placeId) => {
    if (!places) return;
    const selected = places.find((pl) => pl.id === placeId);
    if (selected) {
      setPlace(selected);
      setActivePlaceId(placeId);

      const params = new URLSearchParams(location.search);
      params.set("place", String(placeId));
      navigate({ pathname: "/", search: params.toString() }, { replace: false });
    }
  };

  // перетворення place -> marker
  const placeToMarker = (p) => ({
    lat: p.lat,
    lng: p.lng,
    title: p.name,
    placeId: p.id,
    sportName: p.sportName,
  });

  // обробка вибору виду спорту з сайдбару
  const handleSportSelect = (sportName) => {
    setActiveSport(sportName);
    // опційно: очищаємо пошук при виборі спорту
    // setSearch("");
  };

  // відфільтрований список місць (пошук + вид спорту)
  const filteredPlaces = useMemo(() => {
    if (!places) return [];

    return places.filter((pl) => {
      const matchSport = activeSport ? pl.sportName === activeSport : true;

      const text = `${pl.name || ""} ${pl.description || ""} ${pl.adress || ""
        }`.toLowerCase();
      const query = search.trim().toLowerCase();
      const matchSearch = query ? text.includes(query) : true;

      return matchSport && matchSearch;
    });
  }, [places, activeSport, search]);

  // маркери для карти — завжди по відфільтрованому списку
  const markersForMap = useMemo(() => {
    if (!filteredPlaces || filteredPlaces.length === 0) return [];
    return filteredPlaces.map(placeToMarker);
  }, [filteredPlaces]);

  const clearSportFilter = () => {
    setActiveSport(null);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const clearAllFilters = () => {
    setSearch("");
    setActiveSport(null);
  };

  const handleClosePlaceCard = () => {
    setPlace(null);
    setActivePlaceId(null);

    const params = new URLSearchParams(location.search);
    params.delete("place");
    navigate(
      { pathname: "/", search: params.toString() },
      { replace: false }
    );
  };

  const resultsCount = filteredPlaces.length;

  return (
    <div className={style.contentContainer}>
      <div className={style.sidebar}>
        <SideBar onSportSelect={handleSportSelect} />
      </div>

      <div className={style.mainArea}>
        {/* Топбар з пошуком і фільтрами */}
        <div className={style.topBar}>
          <div className={style.topBarRow}>
            <div className={style.searchInput}>
              <input
                type="text"
                placeholder="Пошук локацій за назвою або описом..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className={style.clearSearchBtn}
                  onClick={clearSearch}
                >
                  ✕
                </button>
              )}
            </div>

            {resultsCount > 0 && (
              <span className={style.resultsBadge}>
                Знайдено {resultsCount} місць
              </span>
            )}
          </div>

          <div className={style.filtersRow}>
            {activeSport && (
              <button
                type="button"
                className={`${style.chip} ${style.chipActive}`}
                onClick={clearSportFilter}
              >
                Вид спорту: {activeSport}
                <span className={style.chipClose}>✕</span>
              </button>
            )}

            {search && (
              <button
                type="button"
                className={style.chip}
                onClick={clearSearch}
              >
                Пошук: «{search}»
                <span className={style.chipClose}>✕</span>
              </button>
            )}

            {(activeSport || search) && (
              <button
                type="button"
                className={style.clearAllBtn}
                onClick={clearAllFilters}
              >
                Скинути фільтри
              </button>
            )}
          </div>
        </div>

        <div
          className={`${style["map-container"]} ${place ? style["map-collapsed"] : ""
            }`}
        >
          <Map
            places={places}
            onDataRecieve={handlePlace}
            selectedMarkers={markersForMap}
            activePlaceId={activePlaceId}
          />
        </div>

        {error && <p style={{ color: "red", marginTop: "0.6rem" }}>{error}</p>}
      </div>

      {place && (
        <PlaceCard
          place={place}
          onClose={handleClosePlaceCard}
        />
      )}
    </div>
  );
};

export default Home;
