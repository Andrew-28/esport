// AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { API_BASE_URL } from "../../config/apiConfig";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalNews: 0,
    totalSuggestions: 0,
    pendingSuggestions: 0,
  });

  const [latestSuggestions, setLatestSuggestions] = useState([]);
  const [latestPlaces, setLatestPlaces] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token") || "";

        const [placesRes, newsRes, suggestionsRes, activityRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/places`),
            fetch(`${API_BASE_URL}/api/news`),
            fetch(`${API_BASE_URL}/api/suggestions`, {
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token,
              },
            }),
            fetch(
              `${API_BASE_URL}/api/admin/activity/recent?limit=20`,
              {
                headers: {
                  "Content-Type": "application/json",
                  "x-auth-token": token,
                },
              }
            ),
          ]);

        const [
          placesData,
          newsData,
          suggestionsData,
          activityData,
        ] = await Promise.all([
          placesRes.json(),
          newsRes.json(),
          suggestionsRes.json(),
          activityRes.json(),
        ]);

        if (
          !placesRes.ok ||
          !newsRes.ok ||
          !suggestionsRes.ok ||
          !activityRes.ok
        ) {
          throw new Error("Не вдалося завантажити дані для дашборду");
        }

        const placesArray = Array.isArray(placesData) ? placesData : [];
        const newsArray = Array.isArray(newsData) ? newsData : [];
        const suggestionsArray = Array.isArray(suggestionsData)
          ? suggestionsData
          : [];

        const pending = suggestionsArray.filter(
          (s) => s.status === "pending"
        );

        setStats({
          totalPlaces: placesArray.length,
          totalNews: newsArray.length,
          totalSuggestions: suggestionsArray.length,
          pendingSuggestions: pending.length,
        });

        // останні 5 "pending" пропозицій
        const latestPendingSuggestions = pending
          .slice()
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.updatedAt || 0) -
              new Date(a.createdAt || a.updatedAt || 0)
          )
          .slice(0, 5);

        setLatestSuggestions(latestPendingSuggestions);

        // останні 5 локацій
        const latestPlacesList = placesArray
          .slice()
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.createdAt || 0)
          )
          .slice(0, 5);

        setLatestPlaces(latestPlacesList);

        // активність
        const activityArray = Array.isArray(activityData)
          ? activityData
          : [];
        setRecentActivity(activityArray);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(
          err.message || "Помилка завантаження даних для дашборду"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Огляд системи</h2>
          <p className={styles.pageSubtitle}>
            Коротка статистика платформи та останні дії, які потребують
            уваги модератора.
          </p>
        </div>

        <div className={styles.quickLinks}>
          <Link to="/admin/suggestions" className={styles.quickLinkBtn}>
            Перейти до пропозицій
          </Link>
          <Link to="/admin/places" className={styles.quickLinkBtnGhost}>
            Керування локаціями
          </Link>
        </div>
      </header>

      {loading ? (
        <p className={styles.muted}>Завантаження даних дашборду…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <>
          {/* Верхній ряд – ключові метрики */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Локацій на мапі</p>
              <p className={styles.statValue}>{stats.totalPlaces}</p>
              <p className={styles.statHint}>
                Всі доступні користувачам точки на мапі.
              </p>
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Запропонованих місць</p>
              <p className={styles.statValue}>{stats.totalSuggestions}</p>
              <p className={styles.statHint}>
                Усі пропозиції, створені користувачами.
              </p>
            </div>

            <div
              className={`${styles.statCard} ${styles.statCardAccent}`}
            >
              <p className={styles.statLabel}>На модерації</p>
              <p className={styles.statValue}>
                {stats.pendingSuggestions}
              </p>
              <p className={styles.statHint}>
                Потребують перевірки й затвердження.
              </p>
              <Link
                to="/admin/suggestions?status=pending"
                className={styles.statLink}
              >
                Відкрити список
              </Link>
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Новин опубліковано</p>
              <p className={styles.statValue}>{stats.totalNews}</p>
              <p className={styles.statHint}>
                Кількість інформаційних матеріалів у розділі “Новини”.
              </p>
            </div>
          </section>

          {/* Нижній блок – пропозиції + локації */}
          <section className={styles.bottomGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Останні пропозиції</h3>
                <span className={styles.cardBadge}>
                  {stats.pendingSuggestions} на модерації
                </span>
              </div>

              {latestSuggestions.length === 0 ? (
                <p className={styles.muted}>
                  Немає пропозицій у статусі “на модерації”.
                </p>
              ) : (
                <ul className={styles.list}>
                  {latestSuggestions.map((s) => (
                    <li key={s._id} className={styles.listItem}>
                      <div className={styles.listTitleRow}>
                        <span className={styles.listTitle}>{s.name}</span>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status-${s.status}`]
                          }`}
                        >
                          {s.status === "pending" && "На модерації"}
                          {s.status === "approved" && "Схвалено"}
                          {s.status === "rejected" && "Відхилено"}
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
                        {s.createdAt
                          ? new Date(
                              s.createdAt
                            ).toLocaleString("uk-UA")
                          : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.cardFooter}>
                <Link
                  to="/admin/suggestions"
                  className={styles.cardFooterLink}
                >
                  Всі пропозиції →
                </Link>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Останні локації</h3>
                <span className={styles.cardBadge}>
                  {stats.totalPlaces} всього
                </span>
              </div>

              {latestPlaces.length === 0 ? (
                <p className={styles.muted}>
                  Локацій поки немає. Додайте перші точки через пропозиції
                  або розділ “Локації”.
                </p>
              ) : (
                <ul className={styles.list}>
                  {latestPlaces.map((p) => (
                    <li key={p.id || p._id} className={styles.listItem}>
                      <div className={styles.listTitleRow}>
                        <span className={styles.listTitle}>{p.name}</span>
                      </div>
                      <div className={styles.listMetaRow}>
                        <span className={styles.listSport}>
                          {p.sportName || "Вид спорту не вказано"}
                        </span>
                        {p.adress && (
                          <span className={styles.listAddress}>
                            {p.adress}
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

              <div className={styles.cardFooter}>
                <Link
                  to="/admin/places"
                  className={styles.cardFooterLink}
                >
                  Керувати локаціями →
                </Link>
              </div>
            </div>
          </section>

          {/* 🔥 Новий блок – останні дії користувачів */}
          <section className={styles.activitySection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>
                  Останні дії користувачів
                </h3>
                <span className={styles.cardBadge}>
                  {recentActivity.length} записів
                </span>
              </div>

              {recentActivity.length === 0 ? (
                <p className={styles.muted}>
                  Поки що немає активності (коментарів або оцінок).
                </p>
              ) : (
                <ul className={styles.list}>
                  {recentActivity.map((a) => (
                    <li key={a.id} className={styles.listItem}>
                      <div className={styles.listTitleRow}>
                        <span className={styles.listTitle}>
                          {a.place?.name || "Невідома локація"}
                        </span>
                        <span
                          className={`${styles.activityType} ${
                            a.type === "comment"
                              ? styles.activityTypeComment
                              : styles.activityTypeRating
                          }`}
                        >
                          {a.type === "comment" ? "Коментар" : "Оцінка"}
                        </span>
                      </div>

                      <div className={styles.listMetaRow}>
                        {a.type === "comment" && a.text && (
                          <span className={styles.activityText}>
                            «
                            {a.text.length > 80
                              ? a.text.slice(0, 77) + "…"
                              : a.text}
                            »
                          </span>
                        )}

                        {a.type === "rating" &&
                          typeof a.rating === "number" && (
                            <span className={styles.activityRating}>
                              Оцінка: {a.rating} ★
                            </span>
                          )}
                      </div>

                      <div className={styles.listMetaRow}>
                        {a.user && (
                          <span className={styles.listUser}>
                            {a.user.name} ({a.user.email})
                          </span>
                        )}
                        <span className={styles.listDateRow}>
                          {a.createdAt
                            ? new Date(
                                a.createdAt
                              ).toLocaleString("uk-UA")
                            : ""}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
