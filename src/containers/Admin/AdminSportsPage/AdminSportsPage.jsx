// AdminSportsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminSportsPage.module.css";
import { API_BASE_URL } from "../../../config/apiConfig";

const CATEGORIES = ["Індивідуальні", "Командні", "Інші"];

const AdminSportsPage = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selected, setSelected] = useState(null); // поточний вибраний вид
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Індивідуальні",
    subspeciesText: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // ====== Завантаження списку ======
  const loadSports = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/sports/list`, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Не вдалося завантажити види спорту");
        setSports([]);
      } else {
        setSports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching sports list", err);
      setError("Помилка сервера при завантаженні видів спорту");
      setSports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSports();
  }, []);

  // ====== Коли змінюється selected — оновлюємо форму ======
  useEffect(() => {
    if (!selected) {
      setForm({
        name: "",
        category: "Індивідуальні",
        subspeciesText: "",
      });
      setSaveMessage("");
      return;
    }

    setForm({
      name: selected.name || "",
      category: selected.category || "Індивідуальні",
      subspeciesText: Array.isArray(selected.subspecies)
        ? selected.subspecies.join("\n")
        : "",
    });
    setSaveMessage("");
  }, [selected]);

  // ====== Фільтрація / пошук ======
  const filteredSports = useMemo(() => {
    const q = search.trim().toLowerCase();

    return sports.filter((s) => {
      const categoryOk =
        categoryFilter === "all" ? true : s.category === categoryFilter;

      const text = [
        s.name,
        s.category,
        ...(Array.isArray(s.subspecies) ? s.subspecies : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const searchOk = q ? text.includes(q) : true;

      return categoryOk && searchOk;
    });
  }, [sports, search, categoryFilter]);

  // ====== Обробники ======
  const handleSelectSport = (sport) => {
    setIsNew(false);
    setSelected(sport);
  };

  const handleCreateNew = () => {
    setIsNew(true);
    setSelected(null);
    setForm({
      name: "",
      category: "Індивідуальні",
      subspeciesText: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Перетворення subspeciesText -> масив
  const extractSubspeciesArray = () => {
    return form.subspeciesText
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Немає токена авторизації");
        setSaving(false);
        return;
      }

      const payload = {
        name: form.name,
        category: form.category,
        subspecies: extractSubspeciesArray(),
      };

      const url = isNew
        ? `${API_BASE_URL}/api/sports`
        : `${API_BASE_URL}/api/sports/${selected._id}`;

      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError(data.msg || "Не вдалося зберегти вид спорту");
        }
        return;
      }

      // Оновлюємо список
      if (isNew) {
        setSports((prev) => [...prev, data].sort((a, b) => {
          if (a.category === b.category) {
            return a.name.localeCompare(b.name, "uk");
          }
          return a.category.localeCompare(b.category, "uk");
        }));
        setIsNew(false);
        setSelected(data);
      } else {
        setSports((prev) =>
          prev.map((s) => (s._id === data._id ? data : s))
        );
        setSelected(data);
      }

      setSaveMessage("Зміни збережено");
    } catch (err) {
      console.error("Error saving sport", err);
      setError("Помилка сервера при збереженні виду спорту");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || isNew) return;

    const confirmed = window.confirm(
      `Видалити вид спорту "${selected.name}"? Це не вплине на вже існуючі локації, у них просто залишиться старий текст у полі sportName.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSaveMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Немає токена авторизації");
        setDeleting(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/sports/${selected._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Не вдалося видалити вид спорту");
        return;
      }

      setSports((prev) => prev.filter((s) => s._id !== selected._id));
      setSelected(null);
      setIsNew(false);
      setForm({
        name: "",
        category: "Індивідуальні",
        subspeciesText: "",
      });
      setSaveMessage("Вид спорту видалено");
    } catch (err) {
      console.error("Error deleting sport", err);
      setError("Помилка сервера при видаленні виду спорту");
    } finally {
      setDeleting(false);
    }
  };

  // Лічильники по категоріях
  const stats = useMemo(() => {
    return sports.reduce(
      (acc, s) => {
        acc.total += 1;
        if (s.category === "Індивідуальні") acc.individual += 1;
        if (s.category === "Командні") acc.team += 1;
        if (s.category !== "Індивідуальні" && s.category !== "Командні")
          acc.other += 1;
        return acc;
      },
      { total: 0, individual: 0, team: 0, other: 0 }
    );
  }, [sports]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Види спорту</h2>
          <p className={styles.pageSubtitle}>
            Керування довідником видів спорту, категоріями та підвидами
            (наприклад: Командні → Баскетбол → 3×3, 5×5).
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Ліва колонка — пошук + список */}
        <section className={styles.left}>
          <div className={styles.searchBlock}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Пошук за назвою, категорією або підвидом…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterChip} ${
                categoryFilter === "all" ? styles.filterChipActive : ""
              }`}
              onClick={() => setCategoryFilter("all")}
            >
              Всі ({stats.total})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${
                categoryFilter === "Індивідуальні"
                  ? styles.filterChipActive
                  : ""
              }`}
              onClick={() => setCategoryFilter("Індивідуальні")}
            >
              Індивідуальні ({stats.individual})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${
                categoryFilter === "Командні"
                  ? styles.filterChipActive
                  : ""
              }`}
              onClick={() => setCategoryFilter("Командні")}
            >
              Командні ({stats.team})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${
                categoryFilter === "other" ? styles.filterChipActive : ""
              }`}
              onClick={() => setCategoryFilter("other")}
            >
              Інші ({stats.other})
            </button>
          </div>

          <div className={styles.listCard}>
            {loading ? (
              <p className={styles.muted}>Завантаження довідника…</p>
            ) : filteredSports.length === 0 ? (
              <p className={styles.muted}>
                Немає видів спорту за заданими фільтрами.
              </p>
            ) : (
              <ul className={styles.list}>
                {filteredSports.map((s) => (
                  <li
                    key={s._id}
                    className={`${styles.listItem} ${
                      selected && s._id === selected._id
                        ? styles.listItemActive
                        : ""
                    }`}
                    onClick={() => handleSelectSport(s)}
                  >
                    <div className={styles.listTitleRow}>
                      <span className={styles.listTitle}>{s.name}</span>
                      <span className={styles.listCategory}>
                        {s.category}
                      </span>
                    </div>
                    {Array.isArray(s.subspecies) &&
                      s.subspecies.length > 0 && (
                        <div className={styles.listSubspecies}>
                          {s.subspecies.join(" · ")}
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {/* Права колонка — форма редагування / створення */}
        <section className={styles.right}>
          <div className={styles.detailsHeader}>
            <div>
              <h3 className={styles.detailsTitle}>
                {isNew
                  ? "Новий вид спорту"
                  : selected
                  ? selected.name
                  : "Оберіть вид спорту або створіть новий"}
              </h3>
              <p className={styles.detailsSubtitle}>
                Заповніть базову інформацію та підвиди. Підвиди будуть
                використовуватися у каталозі та автодоповненні.
              </p>
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleCreateNew}
            >
              + Створити новий
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.formRow}>
              <label>Назва виду спорту</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Напр.: Баскетбол"
              />
            </div>

            <div className={styles.formRow}>
              <label>Категорія</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <label>Підвиди (кожен з нового рядка)</label>
              <textarea
                name="subspeciesText"
                rows={5}
                value={form.subspeciesText}
                onChange={handleFormChange}
                placeholder={"Наприклад:\n3×3\n5×5\nStreetball"}
              />
              <p className={styles.hint}>
                Ці значення потім зʼявляться в каталозі як окремі чіпи, а
                також у полі автодоповнення. Якщо підвидів немає — можна
                залишити порожнім, тоді у фронті буде просто “{form.name || "Назва виду"}”.
              </p>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>

              {!isNew && selected && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Видалення..." : "Видалити"}
                </button>
              )}
            </div>

            {saveMessage && (
              <p className={styles.success}>{saveMessage}</p>
            )}
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSportsPage;
