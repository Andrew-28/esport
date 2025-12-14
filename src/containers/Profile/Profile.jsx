import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Navigation/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { isAuthenticated, isLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    avatarUrl: "",
    favoriteSportsText: "",
    emailOnSuggestionStatus: true,
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setError("Щоб переглянути профіль, потрібно увійти в систему.");
    }
  }, [isLoading, isAuthenticated]);

  const url = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoadingProfile(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${url}/api/profile/me`, {
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.msg || "Не вдалося завантажити профіль");
        } else {
          setProfile(data);

          setEditForm({
            name: data.user.name || "",
            avatarUrl: data.user.avatarUrl || "",
            favoriteSportsText: (data.user.favoriteSports || []).join(", "),
            emailOnSuggestionStatus:
              data.user.notificationSettings?.emailOnSuggestionStatus ?? true,
          });
        }
      } catch (err) {
        console.error("Помилка при завантаженні профілю:", err);
        setError("Сталася помилка при завантаженні профілю");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");
    setError("");

    const favoriteSports = editForm.favoriteSportsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${url}/api/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          name: editForm.name,
          avatarUrl: editForm.avatarUrl,
          favoriteSports,
          emailOnSuggestionStatus: editForm.emailOnSuggestionStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors[0].msg);
        } else {
          setError(data.msg || "Не вдалося зберегти зміни профілю");
        }
      } else {
        setSaveMessage("Зміни збережено");

        setProfile((prev) =>
          prev
            ? {
              ...prev,
              user: {
                ...prev.user,
                name: data.name,
                avatarUrl: data.avatarUrl,
                favoriteSports: data.favoriteSports,
                notificationSettings: data.notificationSettings,
              },
            }
            : prev
        );

        updateUser({
          name: data.name,
          avatarUrl: data.avatarUrl,
        });

        setIsEditing(false);
      }
    } catch (err) {
      console.error("Помилка при збереженні профілю:", err);
      setError("Помилка сервера при збереженні профілю");
    } finally {
      setSaving(false);
    }
  };

  const openFavoriteOnMap = (placeId) => {
    navigate(`/?place=${placeId}`);
  };

  if (isLoading || loadingProfile) {
    return <div className="profile-container">Завантаження профілю...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-container">
        <p>{error}</p>
        <Link to="/login">Перейти до форми входу</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <p>Профіль не знайдено.</p>
      </div>
    );
  }

  const {
    user,
    stats,
    reviews = [],
    comments = [],
    suggestions = [],
    favorites = [],
  } = profile;

  // Формуємо універсальний фід активності (останні 10 дій)
  const buildActivityFeed = () => {
    const items = [];

    (reviews || []).forEach((r) => {
      items.push({
        id: `review-${r._id || r.id}`,
        type: "review",
        date: r.date || r.createdAt,
        placeName: r.placeName || r.place?.name,
        rating: r.rating,
      });
    });

    (comments || []).forEach((c) => {
      items.push({
        id: `comment-${c._id || c.id}`,
        type: "comment",
        date: c.date || c.createdAt,
        placeName: c.placeName || c.place?.name,
        text: c.text,
      });
    });

    (suggestions || []).forEach((s) => {
      items.push({
        id: `suggestion-${s._id || s.id}`,
        type: "suggestion",
        date: s.date || s.createdAt,
        placeName: s.name,
        status: s.status, // pending / approved / rejected (як у тебе на бекенді)
      });
    });

    (favorites || []).forEach((f) => {
      items.push({
        id: `favorite-${f.id}`,
        type: "favorite",
        date: f.createdAt,
        placeName: f.placeName,
        sportName: f.sportName,
      });
    });

    return items
      .filter((it) => it.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const activityFeed = buildActivityFeed();


  const emailNotifEnabled =
    user.notificationSettings?.emailOnSuggestionStatus ?? true;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Мій профіль</h2>

      {/* Основна інформація + аватар */}
      <section className="profile-section">
        <div className="profile-section-header">
          <h3>Основна інформація</h3>
          <p>Базові дані облікового запису та персоналізація.</p>
        </div>

        <div className="profile-main-block">
          <div className="profile-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <div className="avatar-placeholder">
                {user.name ? user.name[0]?.toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div className="profile-info">
            <p>
              <strong>Ім&apos;я:</strong> {user.name}
            </p>
            <p>
              <strong>E-mail:</strong> {user.email}
            </p>
            <p>
              <strong>Роль:</strong> {user.role}
            </p>
            <p>
              <strong>Зареєстрований з:</strong>{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </p>
            <p>
              <strong>Улюблені види спорту:</strong>{" "}
              {user.favoriteSports && user.favoriteSports.length > 0
                ? user.favoriteSports.join(", ")
                : "не вказано"}
            </p>
            <p>
              <strong>Сповіщення про статус пропозицій:</strong>{" "}
              {emailNotifEnabled ? "увімкнено" : "вимкнено"}
            </p>
          </div>
        </div>

        <button
          className="profile-edit-btn"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Скасувати" : "Редагувати профіль"}
        </button>

        {isEditing && (
          <form className="profile-edit-form" onSubmit={handleSaveProfile}>
            <div className="form-row">
              <label>Ім&apos;я</label>
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-row">
              <label>URL аватару</label>
              <input
                type="text"
                name="avatarUrl"
                value={editForm.avatarUrl}
                onChange={handleEditChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-row">
              <label>Улюблені види спорту (через кому)</label>
              <input
                type="text"
                name="favoriteSportsText"
                value={editForm.favoriteSportsText}
                onChange={handleEditChange}
                placeholder="Футбол, Плавання, Баскетбол"
              />
            </div>

            {/* Налаштування: поштові сповіщення */}
            <div className="form-row form-row-inline">
              <div className="form-row-label">
                <label>Сповіщення про статус пропозицій</label>
                <p className="form-row-hint">
                  Надсилати e-mail, коли модератор змінює статус вашої
                  запропонованої локації.
                </p>
              </div>
              <div className="toggle-wrapper">
                <span className="toggle-text">
                  {editForm.emailOnSuggestionStatus
                    ? "Увімкнено"
                    : "Вимкнено"}
                </span>
                <button
                  type="button"
                  className={`toggle-switch ${editForm.emailOnSuggestionStatus
                    ? "toggle-on"
                    : "toggle-off"
                    }`}
                  onClick={() =>
                    setEditForm((prev) => ({
                      ...prev,
                      emailOnSuggestionStatus:
                        !prev.emailOnSuggestionStatus,
                    }))
                  }
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            {error && <p className="message error">{error}</p>}
            {saveMessage && <p className="message success">{saveMessage}</p>}

            <button className="btn-submit" type="submit" disabled={saving}>
              {saving ? "Збереження..." : "Зберегти"}
            </button>
          </form>
        )}
      </section>

      {/* Статистика */}
      <section className="profile-section">
        <h3>Активність</h3>
        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.reviewsCount}</span>
            <span className="stat-label">оцінок</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.commentsCount}</span>
            <span className="stat-label">коментарів</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.suggestionsCount}</span>
            <span className="stat-label">пропозицій</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.favoritesCount}</span>
            <span className="stat-label">обраних</span>
          </div>
        </div>
      </section>

      {/* Остання активність */}
      <section className="profile-section">
        <h3>Остання активність</h3>

        {activityFeed.length === 0 ? (
          <p className="profile-muted">
            Поки що немає історії дій. Оцінюйте локації, залишайте коментарі
            та додавайте їх в обрані — і вони зʼявляться тут.
          </p>
        ) : (
          <ul className="activity-list">
            {activityFeed.map((item) => (
              <li
                key={item.id}
                className={`activity-item activity-${item.type}`}
              >
                <div className="activity-icon">
                  {item.type === "review" && "★"}
                  {item.type === "comment" && "💬"}
                  {item.type === "suggestion" && "✉"}
                  {item.type === "favorite" && "❤"}
                </div>

                <div className="activity-main">
                  <div className="activity-header">
                    <span className={`activity-chip chip-${item.type}`}>
                      {item.type === "review" && "Оцінка"}
                      {item.type === "comment" && "Коментар"}
                      {item.type === "suggestion" && "Пропозиція"}
                      {item.type === "favorite" && "Обране"}
                    </span>
                    <span className="activity-date">
                      {new Date(item.date).toLocaleString()}
                    </span>
                  </div>

                  <p className="activity-text">
                    {item.type === "review" && (
                      <>
                        Ви оцінили <strong>{item.placeName}</strong> на{" "}
                        <strong>{item.rating}</strong>★
                      </>
                    )}

                    {item.type === "comment" && (
                      <>
                        Ви прокоментували{" "}
                        <strong>{item.placeName}</strong>:{" "}
                        <span className="activity-comment-text">
                          {item.text}
                        </span>
                      </>
                    )}

                    {item.type === "suggestion" && (
                      <>
                        Ви запропонували нову локацію{" "}
                        <strong>{item.placeName}</strong>{" "}
                        {item.status && (
                          <span className={`activity-status status-${item.status}`}>
                            {item.status === "pending" && "— на модерації"}
                            {item.status === "approved" && "— схвалено"}
                            {item.status === "rejected" && "— відхилено"}
                          </span>
                        )}
                      </>
                    )}

                    {item.type === "favorite" && (
                      <>
                        Ви додали <strong>{item.placeName}</strong> до обраних{" "}
                        {item.sportName && (
                          <span className="activity-sport">({item.sportName})</span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>


      {/* TODO: Мої оцінки / коментарі / пропозиції — можна додати окремими секціями */}

      {/* Обрані місця як колекція */}
      <section className="profile-section" id="favorites">
        <div className="profile-section-header">
          <h3>Мої обрані місця</h3>
          <p>Збережені локації, до яких ви хочете повернутися.</p>
        </div>

        {favorites.length === 0 ? (
          <p className="profile-empty">
            Ви ще не додали жодного місця в обрані.
          </p>
        ) : (
          <div className="favorites-grid">
            {favorites.map((f) => (
              <article key={f.id} className="favorite-card">
                <div className="favorite-card-header">
                  <span className="favorite-badge">
                    {f.sportName || "Спортивна локація"}
                  </span>
                </div>
                <h4 className="favorite-title">
                  {f.placeName || "Назва недоступна"}
                </h4>
                <p className="favorite-meta">
                  Додано:{" "}
                  {f.createdAt
                    ? new Date(f.createdAt).toLocaleString()
                    : "—"}
                </p>

                <button
                  type="button"
                  className="favorite-open-btn"
                  onClick={() => openFavoriteOnMap(f.id)}
                >
                  Відкрити на мапі
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
