// AdminSuggestionsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "../Suggestions/AdminSuggestionsPage.module.css"; // реюзаємо ті ж стилі
import { API_BASE_URL } from "../../../config/apiConfig";

import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const defaultCenter = { lat: 48.4672, lng: 35.0332 };

const AdminPlacesPage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // 1. Завантаження локацій
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token") || "";

        const res = await fetch(`${API_BASE_URL}/api/admin/places`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Не вдалося завантажити локації.");
          setPlaces([]);
        } else {
          const arr = Array.isArray(data) ? data : [];
          setPlaces(arr);
          if (arr.length > 0) {
            setActiveId(arr[0].id);
          }
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError("Помилка сервера при завантаженні локацій.");
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // 2. Поточна активна локація
  const activePlace = useMemo(
    () => places.find((p) => p.id === activeId) || null,
    [places, activeId]
  );

  // 3. Коли змінилась активна локація – підставляємо форму
  useEffect(() => {
    if (!activePlace) {
      setEditForm(null);
      return;
    }

    setEditForm({
      name: activePlace.name || "",
      description: activePlace.description || "",
      address: activePlace.address || "",
      contacts: activePlace.contacts || "",
      workingHours: activePlace.workingHours || "",
      sportName: activePlace.sportName || "",
      lat:
        typeof activePlace.lat === "number"
          ? activePlace.lat.toFixed(6)
          : "",
      lng:
        typeof activePlace.lng === "number"
          ? activePlace.lng.toFixed(6)
          : "",
    });
    setSaveMessage("");
  }, [activePlace]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const token = localStorage.getItem("token") || "";

  // 4. Збереження змін
  const savePlaceChanges = async () => {
    if (!activePlace || !editForm) return;
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/places/${activePlace.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Не вдалося зберегти зміни локації");
        return;
      }

      setPlaces((prev) =>
        prev.map((p) => (p.id === data.id ? data : p))
      );
      setSaveMessage("Зміни локації збережені.");
    } catch (err) {
      console.error("savePlaceChanges error", err);
      alert("Помилка сервера при збереженні локації");
    } finally {
      setSaving(false);
    }
  };

  // 5. Пошук
  const filteredPlaces = useMemo(() => {
    const q = search.trim().toLowerCase();

    return places.filter((p) => {
      const text = [
        p.name,
        p.sportName,
        p.address,
        p.contacts,
        p.workingHours,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return q ? text.includes(q) : true;
    });
  }, [places, search]);

  // 6. Якщо змінився пошук – не втратити виділення
  useEffect(() => {
    if (filteredPlaces.length === 0) {
      setActiveId(null);
      return;
    }

    const stillExists = filteredPlaces.some((p) => p.id === activeId);
    if (!stillExists) {
      setActiveId(filteredPlaces[0].id);
    }
  }, [filteredPlaces, activeId]);

  // координати для карти
  const mapCenter = activePlace && activePlace.lat && activePlace.lng
    ? [activePlace.lat, activePlace.lng]
    : [defaultCenter.lat, defaultCenter.lng];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Локації</h2>
          <p className={styles.pageSubtitle}>
            Усі точки, які бачать користувачі на мапі. Оберіть локацію,
            відредагуйте дані або координати.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Ліва колонка: пошук + список */}
        <section className={styles.left}>
          <div className={styles.searchBlock}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Пошук за назвою, видом спорту, адресою..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.listCard}>
            {loading ? (
              <p className={styles.muted}>Завантаження локацій…</p>
            ) : filteredPlaces.length === 0 ? (
              <p className={styles.muted}>
                Немає локацій за заданим фільтром.
              </p>
            ) : (
              <ul className={styles.list}>
                {filteredPlaces.map((p) => (
                  <li
                    key={p.id}
                    className={`${styles.listItem} ${
                      p.id === activeId ? styles.listItemActive : ""
                    }`}
                    onClick={() => setActiveId(p.id)}
                  >
                    <div className={styles.listTitleRow}>
                      <span className={styles.listTitle}>{p.name}</span>
                      {typeof p.legacyId === "number" && (
                        <span className={styles.smallBadge}>
                          ID: {p.legacyId}
                        </span>
                      )}
                    </div>
                    <div className={styles.listMetaRow}>
                      <span className={styles.listSport}>
                        {p.sportName || "Вид спорту не вказано"}
                      </span>
                      {p.address && (
                        <span className={styles.listAddress}>
                          {p.address}
                        </span>
                      )}
                    </div>
                    <div className={styles.listDateRow}>
                      Оновлено:{" "}
                      {p.updatedAt || p.createdAt
                        ? new Date(
                            p.updatedAt || p.createdAt
                          ).toLocaleString("uk-UA")
                        : "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {/* Права колонка: форма + мапа */}
        <section className={styles.right}>
          {activePlace && editForm ? (
            <>
              <div className={styles.detailsHeader}>
                <h3 className={styles.detailsTitle}>
                  {editForm.name || "Без назви"}
                </h3>
                <p className={styles.detailsSubtitle}>
                  {editForm.sportName || "Вид спорту не вказано"}
                </p>
              </div>

              <div className={styles.detailsGrid}>
                {/* Основна інформація */}
                <section className={styles.card}>
                  <h3 className={styles.cardTitle}>Основна інформація</h3>

                  <div className={styles.formRow}>
                    <label>Назва</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Вид спорту</label>
                    <input
                      type="text"
                      name="sportName"
                      value={editForm.sportName}
                      onChange={handleEditChange}
                      placeholder="Напр.: Баскетбол 3х3"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Адреса</label>
                    <input
                      type="text"
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Контакти</label>
                    <input
                      type="text"
                      name="contacts"
                      value={editForm.contacts}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Години роботи</label>
                    <input
                      type="text"
                      name="workingHours"
                      value={editForm.workingHours}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Опис</label>
                    <textarea
                      name="description"
                      rows={4}
                      value={editForm.description}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className={styles.formRowInline}>
                    <div>
                      <label>LAT</label>
                      <input
                        type="text"
                        name="lat"
                        value={editForm.lat}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div>
                      <label>LNG</label>
                      <input
                        type="text"
                        name="lng"
                        value={editForm.lng}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={savePlaceChanges}
                      disabled={saving}
                    >
                      {saving ? "Збереження..." : "Зберегти зміни"}
                    </button>

                    {/* опційно: можна буде додати кнопку "Відкрити на публічному сайті" */}
                    {typeof activePlace.legacyId === "number" && (
                      <a
                        href={`/?place=${activePlace.legacyId}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.ghostLink}
                      >
                        Відкрити на мапі →
                      </a>
                    )}
                  </div>

                  {saveMessage && (
                    <p className={styles.success}>{saveMessage}</p>
                  )}
                </section>

                {/* Карта */}
                <section className={styles.card}>
                  <h4 className={styles.cardTitle}>Місце на мапі</h4>
                  <div className={styles.mapWrapper}>
                    <MapContainer
                      center={mapCenter}
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {activePlace.lat && activePlace.lng && (
                        <Marker position={[activePlace.lat, activePlace.lng]} />
                      )}
                    </MapContainer>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <p>Оберіть локацію зліва, щоб переглянути та відредагувати.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPlacesPage;
