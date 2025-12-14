import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useAuth } from "../Navigation/AuthContext";
import { API_BASE_URL } from "../../config/apiConfig";
import "./SuggestPlace.css";

const DniproCenter = {
  lat: 48.46718868150143,
  lng: 35.03321609792512,
};

// окремий компонент для обробки кліку на мапі
const LocationPicker = ({ onPick, markerPosition }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });

  return markerPosition ? <Marker position={markerPosition} /> : null;
};

// хелпер: розплющуємо /api/sports -> список опцій
const buildSportOptions = (kindsOfSports) => {
  if (!kindsOfSports) return [];

  const options = [];
  Object.entries(kindsOfSports).forEach(([category, items]) => {
    (items || []).forEach((item) => {
      const baseName = item.Name;
      const subs = Array.isArray(item.Subspecies) ? item.Subspecies : [];

      if (subs.length === 0) {
        const value = baseName; // саме це піде в sportName
        options.push({
          key: `${category}|${baseName}`,
          value,
          label: value,
          path: `${category} / ${baseName}`,
        });
      } else {
        subs.forEach((sub) => {
          const value = sub; // те, що вже використовується у Tree/SideBar
          options.push({
            key: `${category}|${baseName}|${sub}`,
            value,
            label: value,
            path: `${category} / ${baseName} / ${sub}`,
          });
        });
      }
    });
  });

  return options;
};

const SuggestPlace = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    contacts: "",
    workingHours: "",
    sportName: "",
    lat: "",
    lng: "",
  });

  const [markerPos, setMarkerPos] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // довідник видів спорту
  const [sportsRaw, setSportsRaw] = useState(null);
  const [sportsOptions, setSportsOptions] = useState([]);
  const [sportsLoading, setSportsLoading] = useState(false);
  const [sportsError, setSportsError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Щоб запропонувати місце, потрібно увійти в систему.");
    }
  }, [isAuthenticated]);

  // завантаження довідника видів спорту
  useEffect(() => {
    const fetchSports = async () => {
      setSportsLoading(true);
      setSportsError("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/sports`);
        if (!res.ok) {
          throw new Error("Помилка завантаження видів спорту");
        }
        const data = await res.json();
        const kinds = data["Kinds of sports"] || {};
        setSportsRaw(kinds);
        setSportsOptions(buildSportOptions(kinds));
      } catch (err) {
        console.error("Помилка при завантаженні видів спорту:", err);
        setSportsError("Не вдалося завантажити довідник видів спорту.");
      } finally {
        setSportsLoading(false);
      }
    };

    fetchSports();
  }, []);

  const selectedSportMeta = useMemo(() => {
    if (!form.sportName || !sportsOptions.length) return null;
    return (
      sportsOptions.find((opt) => opt.value === form.sportName) || null
    );
  }, [form.sportName, sportsOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "sportName") {
      setError("");
      setSuccess("");
    }
  };

  const handleMapClick = (latlng) => {
    const { lat, lng } = latlng;
    setMarkerPos(latlng);
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      setError("Авторизуйтесь, щоб надіслати пропозицію.");
      return;
    }

    if (!form.name.trim() || !form.sportName.trim()) {
      setError("Назва місця та вид спорту є обов'язковими полями.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Сесія закінчилась. Увійдіть ще раз.");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          address: form.address,
          contacts: form.contacts,
          workingHours: form.workingHours,
          sportName: form.sportName,
          lat: form.lat || undefined,
          lng: form.lng || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Дякуємо! Ваша пропозиція відправлена на модерацію.");
        setForm({
          name: "",
          description: "",
          address: "",
          contacts: "",
          workingHours: "",
          sportName: "",
          lat: "",
          lng: "",
        });
        setMarkerPos(null);
      } else {
        if (data.msg) {
          setError(data.msg);
        } else if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError("Не вдалося надіслати пропозицію.");
        }
      }
    } catch (err) {
      console.error("Помилка при надсиланні пропозиції:", err);
      setError("Помилка сервера при надсиланні пропозиції.");
    }
  };

  return (
    <div className="suggest-page">
      {/* ЛІВА КОЛОНКА — форма (≈30%) */}
      <div className="suggest-left">
        <h2 className="suggest-title">Запропонувати нове місце</h2>
        <p className="suggest-subtitle">
          Заповніть базову інформацію про локацію. Вид спорту оберіть з
          довідника, а координати можна вказати вручну або просто клікнути по
          мапі праворуч.
        </p>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}

        <form className="suggest-place-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Назва місця *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Наприклад, Стадіон 'Олімпійський'"
            />
          </div>

          <div className="form-row">
            <label>Вид спорту *</label>

            {/* input + datalist, щоб:
                - можна було обрати з довідника;
                - але й дозволити кастомний текст, якщо чогось немає */}
            <input
              type="text"
              name="sportName"
              value={form.sportName}
              onChange={handleChange}
              list="sport-options"
              placeholder={
                sportsLoading
                  ? "Завантаження довідника..."
                  : "Напр.: Баскетбол 3х3"
              }
            />
            <datalist id="sport-options">
              {sportsOptions.map((opt) => (
                <option key={opt.key} value={opt.value}>
                  {opt.path}
                </option>
              ))}
            </datalist>

            {sportsError && (
              <p className="field-hint field-hint-error">{sportsError}</p>
            )}

            {selectedSportMeta ? (
              <p className="field-hint">
                Обрано: <strong>{selectedSportMeta.path}</strong>
              </p>
            ) : form.sportName ? (
              <p className="field-hint">
                Обраний вид спорту не знайдено в довіднику — буде збережено як
                вільний текст.
              </p>
            ) : (
              <p className="field-hint">
                Можна обрати з підказок (категорія / вид / підвид) або ввести
                свій варіант.
              </p>
            )}
          </div>

          <div className="form-row">
            <label>Опис</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Коротко опишіть місце"
            />
          </div>

          <div className="form-row">
            <label>Адреса</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="вул. Прикладна, 10"
            />
          </div>

          <div className="form-row">
            <label>Контакти</label>
            <input
              type="text"
              name="contacts"
              value={form.contacts}
              onChange={handleChange}
              placeholder="+38 (0__) ___-__-__"
            />
          </div>

          <div className="form-row">
            <label>Години роботи</label>
            <input
              type="text"
              name="workingHours"
              value={form.workingHours}
              onChange={handleChange}
              placeholder="Наприклад, Пн-Нд: 9:00-21:00"
            />
          </div>

          <div className="form-row-inline">
            <div>
              <label>Широта (lat)</label>
              <input
                type="text"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                placeholder="48.4671"
              />
            </div>
            <div>
              <label>Довгота (lng)</label>
              <input
                type="text"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                placeholder="35.0332"
              />
            </div>
          </div>

          <button
            className="btn-submit"
            type="submit"
            disabled={!isAuthenticated}
          >
            Надіслати пропозицію
          </button>
        </form>
      </div>

      {/* ПРАВА КОЛОНКА — мапа + превʼю */}
      <div className="suggest-right">
        <div className="suggest-map-panel">
          <div className="suggest-map-header">
            <h3>Координати на мапі</h3>
            <p className="suggest-map-hint">
              Клікніть по мапі, щоб автоматично підставити широту та довготу.
            </p>
          </div>

          <div className="coords-row">
            <div>
              <span className="coords-label">LAT</span>
              <span className="coords-value">{form.lat || "—"}</span>
            </div>
            <div>
              <span className="coords-label">LNG</span>
              <span className="coords-value">{form.lng || "—"}</span>
            </div>
          </div>

          <div className="suggest-map-wrapper">
            <MapContainer
              center={markerPos || DniproCenter}
              zoom={13}
              scrollWheelZoom={true}
              className="suggest-map"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker
                onPick={handleMapClick}
                markerPosition={markerPos}
              />
            </MapContainer>
          </div>
        </div>

        {/* Невелике превʼю майбутньої локації */}
        <div className="suggest-preview-card">
          <h3>Превʼю локації</h3>
          <p>
            <strong>Назва:</strong> {form.name || "—"}
          </p>
          <p>
            <strong>Вид спорту:</strong>{" "}
            {selectedSportMeta
              ? selectedSportMeta.path
              : form.sportName || "—"}
          </p>
          <p>
            <strong>Адреса:</strong> {form.address || "—"}
          </p>
          <p>
            <strong>Години роботи:</strong> {form.workingHours || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestPlace;
