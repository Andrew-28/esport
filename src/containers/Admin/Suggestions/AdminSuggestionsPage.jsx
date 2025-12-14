// AdminSuggestionsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from "./AdminSuggestionsPage.module.css";
import { API_BASE_URL } from "../../../config/apiConfig";

// фікс іконок Leaflet
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

const defaultCenter = { lat: 48.4672, lng: 35.0332 };

const STATUS_LABELS = {
  pending: "На модерації",
  approved: "Схвалено",
  rejected: "Відхилено",
};

const AdminSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected

  const [activeId, setActiveId] = useState(null);

  const [adminComment, setAdminComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [selected, setSelected] = useState(null); // вже є
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  const [sportOptions, setSportOptions] = useState([]);


  // 1. Завантаження всіх пропозицій
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Немає токена авторизації.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Не вдалося завантажити пропозиції.");
          setSuggestions([]);
        } else {
          setSuggestions(Array.isArray(data) ? data : []);
          if (data.length > 0) {
            setActiveId(data[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Помилка сервера при завантаженні пропозицій.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!selected) {
      setEditForm(null);
      return;
    }

    setEditForm({
      name: selected.name || "",
      description: selected.description || "",
      address: selected.address || "",
      contacts: selected.contacts || "",
      workingHours: selected.workingHours || "",
      sportName: selected.sportName || "",
      lat:
        selected.location?.coordinates &&
          selected.location.coordinates.length === 2
          ? selected.location.coordinates[1].toFixed(6)
          : "",
      lng:
        selected.location?.coordinates &&
          selected.location.coordinates.length === 2
          ? selected.location.coordinates[0].toFixed(6)
          : "",
      adminComment: selected.adminComment || "",
      status: selected.status || "pending",
    });
  }, [selected]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Поточна активна пропозиція
  const activeSuggestion = useMemo(
    () => suggestions.find((s) => s._id === activeId) || null,
    [suggestions, activeId]
  );

  useEffect(() => {
    setSelected(activeSuggestion || null);
  }, [activeSuggestion]);

  const token = localStorage.getItem("token");

  const saveSuggestionChanges = async () => {
    if (!selected || !editForm) return;
    setEditSaving(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/suggestions/admin/${selected._id}`,
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
        // можна показати data.msg / data.errors[0].msg
        alert(data.msg || "Не вдалося зберегти зміни пропозиції");
        return;
      }

      // оновлюємо список і вибрану пропозицію
      setSuggestions((prev) =>
        prev.map((s) => (s._id === data._id ? data : s))
      );
      setSelected(data);
    } catch (err) {
      console.error("saveSuggestionChanges error", err);
      alert("Помилка сервера при збереженні пропозиції");
    } finally {
      setEditSaving(false);
    }
  };

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

  // useEffect для завантаження видів спорту
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sports`);
        if (!res.ok) throw new Error("Помилка завантаження видів спорту");
        const data = await res.json();
        const kinds = data["Kinds of sports"] || {};
        setSportOptions(buildSportOptions(kinds)); // можна винести хелпер з SuggestPlace
      } catch (err) {
        console.error("AdminSuggestionsPage: sports load error", err);
      }
    };

    fetchSports();
  }, []);

  const approveAndCreatePlace = async () => {
    if (!selected || !editForm) return;

    // на всяк випадок — спочатку збережемо останні правки
    await saveSuggestionChanges();

    setApproveLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/suggestions/admin/${selected._id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            adminComment: editForm.adminComment,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Не вдалося схвалити пропозицію");
        return;
      }

      const updated = data.suggestion;

      setSuggestions((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
      setSelected(updated);

      alert(
        `Пропозицію схвалено. Створено локацію "${data.place.name}" (id: ${data.place.legacyId}).`
      );
    } catch (err) {
      console.error("approveAndCreatePlace error", err);
      alert("Помилка сервера при схваленні пропозиції");
    } finally {
      setApproveLoading(false);
    }
  };



  // 3. Фільтри (в памʼяті, без додаткових запитів)
  const filteredSuggestions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return suggestions.filter((s) => {
      const statusOk =
        statusFilter === "all" ? true : s.status === statusFilter;

      const text = [
        s.name,
        s.sportName,
        s.address,
        s.contacts,
        s.user?.name,
        s.user?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchOk = q ? text.includes(q) : true;

      return statusOk && searchOk;
    });
  }, [suggestions, search, statusFilter]);

  // 4. Якщо змінюється фільтр/пошук – тримаємо вибрану пропозицію в межах відфільтрованих
  useEffect(() => {
    if (filteredSuggestions.length === 0) {
      setActiveId(null);
      return;
    }

    const stillExists = filteredSuggestions.some((s) => s._id === activeId);
    if (!stillExists) {
      setActiveId(filteredSuggestions[0]._id);
    }
  }, [filteredSuggestions, activeId]);

  // 5. При зміні вибраної пропозиції – підставляємо її adminComment у textarea
  useEffect(() => {
    if (activeSuggestion) {
      setAdminComment(activeSuggestion.adminComment || "");
      setSaveMessage("");
    }
  }, [activeSuggestion]);

  const handleStatusChange = async (newStatus) => {
    if (!activeSuggestion) return;

    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Немає токена авторизації.");
        setSaving(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/suggestions/${activeSuggestion._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            status: newStatus,
            adminComment,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Не вдалося оновити статус пропозиції.");
      } else {
        // оновлюємо локальний список
        setSuggestions((prev) =>
          prev.map((s) => (s._id === data._id ? data : s))
        );
        setSaveMessage("Зміни збережено.");
      }
    } catch (err) {
      console.error("Error updating suggestion:", err);
      setError("Помилка сервера при оновленні статусу.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToPending = () => {
    handleStatusChange("pending");
  };

  // Короткі лічильники для табів (local)
  const stats = useMemo(() => {
    return suggestions.reduce(
      (acc, s) => {
        acc.total += 1;
        if (s.status === "pending") acc.pending += 1;
        if (s.status === "approved") acc.approved += 1;
        if (s.status === "rejected") acc.rejected += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [suggestions]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Пропозиції місць</h2>
          <p className={styles.pageSubtitle}>
            Модерація локацій, запропонованих користувачами. Оберіть запис із
            списку, перегляньте деталі та змініть статус.
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
              placeholder="Пошук за назвою, видом спорту, адресою або юзером..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === "all" ? styles.filterChipActive : ""
                }`}
              onClick={() => setStatusFilter("all")}
            >
              Всі ({stats.total})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === "pending" ? styles.filterChipActive : ""
                }`}
              onClick={() => setStatusFilter("pending")}
            >
              На модерації ({stats.pending})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === "approved" ? styles.filterChipActive : ""
                }`}
              onClick={() => setStatusFilter("approved")}
            >
              Схвалено ({stats.approved})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === "rejected" ? styles.filterChipActive : ""
                }`}
              onClick={() => setStatusFilter("rejected")}
            >
              Відхилено ({stats.rejected})
            </button>
          </div>

          <div className={styles.listCard}>
            {loading ? (
              <p className={styles.muted}>Завантаження пропозицій…</p>
            ) : filteredSuggestions.length === 0 ? (
              <p className={styles.muted}>
                Немає пропозицій за заданими фільтрами.
              </p>
            ) : (
              <ul className={styles.list}>
                {filteredSuggestions.map((s) => (
                  <li
                    key={s._id}
                    className={`${styles.listItem} ${s._id === activeId ? styles.listItemActive : ""
                      }`}
                    onClick={() => setActiveId(s._id)}
                  >
                    <div className={styles.listTitleRow}>
                      <span className={styles.listTitle}>{s.name}</span>
                      <span
                        className={`${styles.statusBadge} ${styles[`status-${s.status}`]
                          }`}
                      >
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </div>
                    <div className={styles.listMetaRow}>
                      <span className={styles.listSport}>
                        {s.sportName || "Вид спорту не вказано"}
                      </span>
                      {s.user && (
                        <span className={styles.listUser}>
                          {s.user.name} ({s.user.email})
                        </span>
                      )}
                    </div>
                    <div className={styles.listDateRow}>
                      Створено:{" "}
                      {new Date(s.createdAt).toLocaleString("uk-UA")}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {/* Права колонка: деталі + дії */}
        {activeSuggestion && editForm ? (
          <section className={styles.right}>
            {activeSuggestion ? (
              <>
                <div className={styles.detailsHeader}>
                  <h3 className={styles.detailsTitle}>{editForm.name || "Без назви"}</h3>
                  <p className={styles.detailsSubtitle}>
                    {activeSuggestion.sportName ||
                      "Вид спорту не вказано"}
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
                        list="admin-sport-options"
                        placeholder="Напр.: Баскетбол 3х3"
                      />
                      <datalist id="admin-sport-options">
                        {sportOptions.map((opt) => (
                          <option key={opt.key} value={opt.value}>
                            {opt.path}
                          </option>
                        ))}
                      </datalist>
                      {editForm.sportName && (
                        <p className={styles.hint}>
                          {
                            (sportOptions.find((o) => o.value === editForm.sportName)
                              ?.path || "Варіант не з довідника — буде збережено як є.")
                          }
                        </p>
                      )}
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

                    <div className={styles.formRowInline}>
                      <div className={styles.formRowInlineFlex}>
                        <label>Статус</label>
                        <select
                          name="status"
                          value={editForm.status}
                          onChange={handleEditChange}
                        >
                          <option value="pending">На модерації</option>
                          <option value="approved">Схвалено</option>
                          <option value="rejected">Відхилено</option>
                        </select>
                      </div>
                      {selected.place && (
                        <div className={styles.smallBadge}>
                          Уже привʼязано до місця #{selected.place.legacyId}
                        </div>
                      )}
                    </div>

                    <div className={styles.actionsRow}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={saveSuggestionChanges}
                        disabled={editSaving}
                      >
                        {editSaving ? "Збереження..." : "Зберегти зміни"}
                      </button>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={approveAndCreatePlace}
                        disabled={approveLoading}
                      >
                        {approveLoading
                          ? "Створення локації..."
                          : "Схвалити і створити локацію"}
                      </button>
                    </div>
                  </section>

                  {/* Користувач */}
                  <div className={styles.card}>
                    <h4 className={styles.cardTitle}>Користувач</h4>
                    <p>
                      <strong>Ім&apos;я:</strong>{" "}
                      {activeSuggestion.user?.name || "—"}
                    </p>
                    <p>
                      <strong>E-mail:</strong>{" "}
                      {activeSuggestion.user?.email || "—"}
                    </p>
                    <p>
                      <strong>Створено:</strong>{" "}
                      {activeSuggestion.createdAt
                        ? new Date(
                          activeSuggestion.createdAt
                        ).toLocaleString("uk-UA")
                        : "—"}
                    </p>
                    <p>
                      <strong>Оновлено:</strong>{" "}
                      {activeSuggestion.updatedAt
                        ? new Date(
                          activeSuggestion.updatedAt
                        ).toLocaleString("uk-UA")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Коментар модератора + дії */}
                <div className={styles.card}>
                  <h4 className={styles.cardTitle}>Коментар модератора</h4>
                  <textarea
                    className={styles.commentInput}
                    placeholder="Наприклад: 'Додайте, будь ласка, точнішу адресу' або 'Схвалено, буде додано до мапи'."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                  />
                  <div className={styles.actionsRow}>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionApprove}`}
                      onClick={() => handleStatusChange("approved")}
                      disabled={saving}
                    >
                      Схвалити
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionReject}`}
                      onClick={() => handleStatusChange("rejected")}
                      disabled={saving}
                    >
                      Відхилити
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionReset}`}
                      onClick={handleResetToPending}
                      disabled={saving}
                    >
                      Повернути в чергу
                    </button>
                  </div>
                  {saveMessage && (
                    <p className={styles.success}>{saveMessage}</p>
                  )}
                </div>

                {/* Мапа */}
                <div className={styles.card}>
                  <h4 className={styles.cardTitle}>Місце на мапі</h4>
                  <div className={styles.mapWrapper}>
                    <MapContainer
                      center={
                        activeSuggestion.location &&
                          Array.isArray(
                            activeSuggestion.location.coordinates
                          ) &&
                          activeSuggestion.location.coordinates.length === 2
                          ? [
                            activeSuggestion.location.coordinates[1],
                            activeSuggestion.location.coordinates[0],
                          ]
                          : [defaultCenter.lat, defaultCenter.lng]
                      }
                      zoom={13}
                      scrollWheelZoom={true}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {activeSuggestion.location &&
                        Array.isArray(
                          activeSuggestion.location.coordinates
                        ) &&
                        activeSuggestion.location.coordinates.length === 2 && (
                          <Marker
                            position={[
                              activeSuggestion.location.coordinates[1],
                              activeSuggestion.location.coordinates[0],
                            ]}
                          />
                        )}
                    </MapContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <p>Оберіть пропозицію зліва, щоб переглянути деталі.</p>
              </div>
            )}
          </section>) : <>  </>}
      </div>
    </div>
  );
};

export default AdminSuggestionsPage;
