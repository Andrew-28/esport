// AdminNewsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminNewsPage.module.css";
import { API_BASE_URL } from "../../../config/apiConfig";

const STATUS_FILTER = {
  ALL: "all",
  PUBLISHED: "published",
  DRAFT: "draft",
};

const emptyForm = {
  _id: null,
  title: "",
  slug: "",
  category: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  isPublished: false,
  publishedAt: "",
};

const AdminNewsPage = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER.ALL);
  const [search, setSearch] = useState("");

  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  
  const token = localStorage.getItem("token");

  // ======= ЗАВАНТАЖЕННЯ =======
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          setError("Немає токена авторизації (зайдіть як адмін).");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/news/admin/all`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Не вдалося завантажити новини.");
          setNewsItems([]);
        } else {
          setNewsItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching news admin list:", err);
        setError("Помилка сервера при завантаженні новин.");
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= ФІЛЬТРИ =======
  const filteredNews = useMemo(() => {
    let items = [...newsItems];

    if (statusFilter === STATUS_FILTER.PUBLISHED) {
      items = items.filter((n) => n.isPublished);
    } else if (statusFilter === STATUS_FILTER.DRAFT) {
      items = items.filter((n) => !n.isPublished);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter((n) => {
        const s = [n.title, n.excerpt, n.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return s.includes(q);
      });
    }

    // нові зверху
    return items.sort((a, b) => {
      const da = new Date(a.createdAt || a.publishedAt || 0).getTime();
      const db = new Date(b.createdAt || b.publishedAt || 0).getTime();
      return db - da;
    });
  }, [newsItems, statusFilter, search]);

  // ======= СИНХРОН АКТИВНОГО =======
  useEffect(() => {
    if (!filteredNews.length) {
      setActiveId(null);
      setForm(emptyForm);
      return;
    }

    const found = filteredNews.find((n) => n._id === activeId);
    if (found) {
      setForm({
        ...found,
        publishedAt: found.publishedAt
          ? new Date(found.publishedAt).toISOString().slice(0, 16)
          : "",
      });
    } else {
      const first = filteredNews[0];
      setActiveId(first._id);
      setForm({
        ...first,
        publishedAt: first.publishedAt
          ? new Date(first.publishedAt).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [filteredNews, activeId]);

  const handleSelect = (item) => {
    setActiveId(item._id);
    setForm({
      ...item,
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString().slice(0, 16)
        : "",
    });
    setSaveMessage("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateNew = () => {
    setActiveId(null);
    setForm(emptyForm);
    setSaveMessage("");
  };

  // ======= ЗБЕРЕГТИ (CREATE/UPDATE) =======
  const handleSave = async () => {
    if (!token) {
      alert("Немає токена авторизації.");
      return;
    }

    if (!form.title.trim() || !form.excerpt.trim()) {
      alert("Заповніть хоча б заголовок і короткий опис.");
      return;
    }

    setSaving(true);
    setSaveMessage("");

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      excerpt: form.excerpt,
      content: form.content,
      imageUrl: form.imageUrl,
      isPublished: form.isPublished,
      publishedAt: form.publishedAt || null,
    };

    try {
      const url =
        form._id === null
          ? `${API_BASE_URL}/api/news/admin`
          : `${API_BASE_URL}/api/news/admin/${form._id}`;

      const method = form._id === null ? "POST" : "PUT";

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
        const msg =
          data.msg ||
          (data.errors && data.errors[0]?.msg) ||
          "Не вдалося зберегти новину.";
        alert(msg);
        return;
      }

      if (form._id === null) {
        // додали нову
        setNewsItems((prev) => [data, ...prev]);
        setActiveId(data._id);
        setForm({
          ...data,
          publishedAt: data.publishedAt
            ? new Date(data.publishedAt).toISOString().slice(0, 16)
            : "",
        });
      } else {
        // оновили існуючу
        setNewsItems((prev) =>
          prev.map((n) => (n._id === data._id ? data : n))
        );
        setForm({
          ...data,
          publishedAt: data.publishedAt
            ? new Date(data.publishedAt).toISOString().slice(0, 16)
            : "",
        });
      }

      setSaveMessage("Зміни збережено.");
    } catch (err) {
      console.error("AdminNewsPage save error:", err);
      alert("Помилка сервера при збереженні новини.");
    } finally {
      setSaving(false);
    }
  };

  // ======= ВИДАЛИТИ =======
  const handleDelete = async () => {
    if (!form._id) return;
    if (!window.confirm("Видалити цю новину безповоротно?")) return;

    if (!token) {
      alert("Немає токена авторизації.");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/news/admin/${form._id}`,
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
        alert(data.msg || "Не вдалося видалити новину.");
        return;
      }

      setNewsItems((prev) => prev.filter((n) => n._id !== form._id));
      setForm(emptyForm);
      setActiveId(null);
      setSaveMessage("");
    } catch (err) {
      console.error("AdminNewsPage delete error:", err);
      alert("Помилка сервера при видаленні новини.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setSelectedFileName(file.name);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/news/admin/upload-image`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.msg || "Не вдалося завантажити зображення.");
        setSelectedFileName("");
        return;
      }

      // URL, який віддає бек – зберігаємо в форму
      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Помилка сервера при завантаженні.");
      setSelectedFileName("");
    }
  };


  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Новини</h2>
          <p className={styles.pageSubtitle}>
            Створення і публікація новин, які бачать користувачі у вкладці
            &quot;Новини&quot;.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleCreateNew}
        >
          + Нова новина
        </button>
      </header>

      <div className={styles.layout}>
        {/* Ліва колонка: список */}
        <section className={styles.left}>
          <div className={styles.searchBlock}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Пошук за заголовком, категорією або описом..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === STATUS_FILTER.ALL
                ? styles.filterChipActive
                : ""
                }`}
              onClick={() => setStatusFilter(STATUS_FILTER.ALL)}
            >
              Усі ({newsItems.length})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === STATUS_FILTER.PUBLISHED
                ? styles.filterChipActive
                : ""
                }`}
              onClick={() => setStatusFilter(STATUS_FILTER.PUBLISHED)}
            >
              Опубліковані (
              {newsItems.filter((n) => n.isPublished).length})
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${statusFilter === STATUS_FILTER.DRAFT
                ? styles.filterChipActive
                : ""
                }`}
              onClick={() => setStatusFilter(STATUS_FILTER.DRAFT)}
            >
              Чернетки (
              {newsItems.filter((n) => !n.isPublished).length})
            </button>
          </div>

          <div className={styles.listCard}>
            {loading ? (
              <p className={styles.muted}>Завантаження новин…</p>
            ) : filteredNews.length === 0 ? (
              <p className={styles.muted}>
                Немає новин за поточними фільтрами.
              </p>
            ) : (
              <ul className={styles.list}>
                {filteredNews.map((n) => (
                  <li
                    key={n._id}
                    className={`${styles.listItem} ${n._id === activeId ? styles.listItemActive : ""
                      }`}
                    onClick={() => handleSelect(n)}
                  >
                    <div className={styles.listTitleRow}>
                      <span className={styles.listTitle}>{n.title}</span>
                      <span
                        className={`${styles.statusBadge} ${n.isPublished
                          ? styles.statusPublished
                          : styles.statusDraft
                          }`}
                      >
                        {n.isPublished ? "Опубліковано" : "Чернетка"}
                      </span>
                    </div>
                    {n.category && (
                      <div className={styles.listCategory}>{n.category}</div>
                    )}
                    <div className={styles.listDateRow}>
                      {n.publishedAt
                        ? `Опубліковано: ${new Date(
                          n.publishedAt
                        ).toLocaleString("uk-UA")}`
                        : `Створено: ${new Date(
                          n.createdAt
                        ).toLocaleString("uk-UA")}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </section>

        {/* Права колонка: форма + превʼю */}
        <section className={styles.right}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              {form._id ? "Редагування новини" : "Нова новина"}
            </h3>

            <div className={styles.formRow}>
              <label>Заголовок *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formRow}>
              <label>Категорія</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Напр.: Оголошення, Змагання..."
              />
            </div>

            <div className={styles.formRow}>
              <label>Картинка</label>

              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="URL зображення або завантажте файл нижче"
              />

              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="news-image-file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInputNative}
                />
                <label htmlFor="news-image-file" className={styles.fileButton}>
                  Обрати файл
                </label>
                <span className={styles.fileLabel}>
                  {selectedFileName || "Файл не обрано"}
                </span>
              </div>

              {uploadError && <p className={styles.error}>{uploadError}</p>}
            </div>

            {form.imageUrl && (
              <div className={styles.smallPreview}>
                <img src={form.imageUrl} alt="Превʼю" />
              </div>
            )}

            <div className={styles.formRow}>
              <label>Короткий опис (excerpt) *</label>
              <textarea
                name="excerpt"
                rows={2}
                value={form.excerpt}
                onChange={handleChange}
                placeholder="Текст, який показується у списку новин..."
              />
            </div>

            <div className={styles.formRow}>
              <label>Повний текст</label>
              <textarea
                name="content"
                rows={6}
                value={form.content}
                onChange={handleChange}
                placeholder="Основний текст новини. Можна використати у окремій сторінці детального перегляду."
              />
            </div>

            <div className={styles.formRowInline}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleChange}
                />
                Опублікувати
              </label>

              <div className={styles.datetimeField}>
                <label>Дата/час публікації</label>
                <input
                  type="datetime-local"
                  name="publishedAt"
                  value={form.publishedAt}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>

              {form._id && (
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Видалення..." : "Видалити"}
                </button>
              )}
            </div>

            {saveMessage && (
              <p className={styles.success}>{saveMessage}</p>
            )}
          </div>

          {/* Превʼю у стилі публічної карточки */}
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Превʼю карточки новини</h4>
            <article className={styles.previewCard}>
              {form.imageUrl && (
                <div className={styles.previewImageWrapper}>
                  <img src={form.imageUrl} alt={form.title || "news"} />
                </div>
              )}
              <div className={styles.previewContent}>
                <h3 className={styles.previewTitle}>
                  {form.title || "Заголовок новини"}
                </h3>
                {form.category && (
                  <span className={styles.previewCategory}>
                    {form.category}
                  </span>
                )}
                <p className={styles.previewDate}>
                  {form.isPublished
                    ? "Опубліковано " +
                    (form.publishedAt
                      ? new Date(form.publishedAt).toLocaleString("uk-UA")
                      : "після збереження")
                    : "Чернетка"}
                </p>
                <p className={styles.previewExcerpt}>
                  {form.excerpt ||
                    "Короткий опис новини буде відображено тут."}
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminNewsPage;
