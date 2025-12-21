// src/containers/PlaceCard/PlaceCard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../../store/favoritesSlice";
import { PhotoGrid } from "../../components/PhotoGrid";
import { PlaceInfo } from "../../components/PlaceInfo";
import { Rating } from "../../components/Rating";
import { useAuth } from "../Navigation/AuthContext";
import { API_BASE_URL } from "../../config/apiConfig";
import "./PlaceCard.css";

const PlaceCard = ({ place, onClose }) => {
  const { isAuthenticated } = useAuth();
  const cardRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [favError, setFavError] = useState("");

  // рейтинг
  const [avgRating, setAvgRating] = useState(place.rating || 0);
  const [ratingsCount, setRatingsCount] = useState(place.ratingsCount || 0);
  const [userRating, setUserRating] = useState(null);
  const [ratingError, setRatingError] = useState("");

  // маршрут
  const [routeError, setRouteError] = useState("");

  const dispatch = useDispatch();
  const favoriteIds = useSelector((state) => state.favorites.ids);
  const isFavorite = favoriteIds.includes(place.id);

  // якщо змінилося місце — підтягуємо актуальні агреговані значення
  useEffect(() => {
    setAvgRating(place.rating || 0);
    setRatingsCount(place.ratingsCount || 0);
    setFavError("");
    setRouteError("");
  }, [place]);

  // завантаження коментарів для поточного місця
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/comments/${place.id}`
        );
        const data = await response.json();
        setComments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Помилка при отриманні коментарів:", error);
      }
    };

    fetchComments();
  }, [place.id]);

  // підтягнути мою оцінку, якщо юзер залогінений
  useEffect(() => {
    const fetchMyRating = async () => {
      if (!isAuthenticated) {
        setUserRating(null);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUserRating(null);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/reviews/my/${place.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (typeof data.rating === "number") {
            setUserRating(data.rating);
          } else {
            setUserRating(null);
          }
        }
      } catch (err) {
        console.error("Помилка при отриманні моєї оцінки:", err);
      }
    };

    fetchMyRating();
  }, [isAuthenticated, place.id]);

  const handleRatingChange = async (newRating) => {
    setRatingError("");

    if (!isAuthenticated) {
      setRatingError("Щоб оцінити місце, потрібно увійти в систему");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setRatingError("Сесія завершилась, увійдіть ще раз");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/reviews/${place.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ rating: newRating }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserRating(data.rating);
        setAvgRating(data.avgRating);
        setRatingsCount(data.ratingsCount);
      } else {
        setRatingError(data.msg || "Не вдалося зберегти оцінку");
      }
    } catch (err) {
      console.error("Помилка при виставленні оцінки:", err);
      setRatingError("Помилка сервера при збереженні оцінки");
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      setFavError("Щоб додати в обрані, увійдіть в систему");
      return;
    }
    setFavError("");
    dispatch(toggleFavorite(place.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Введіть текст коментаря");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Ви повинні бути авторизовані, щоб залишити коментар");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/comments/${place.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || "Помилка при відправленні коментаря");
        return;
      }

      setComments((prev) => [...prev, data]);
      setText("");
    } catch (error) {
      setError("Помилка при доданні коментаря");
      console.error("Помилка при доданні коментаря", error);
    }
  };

  const handleOpenRoute = () => {
    setRouteError("");

    if (!place.lat || !place.lng) {
      setRouteError("Для цього місця не вказано координати");
      return;
    }

    const destination = `${place.lat},${place.lng}`;
    const baseUrl = "https://www.google.com/maps/dir/?api=1";

    // Geolocation працює на HTTPS або localhost — це можна згадати в дипломі
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const url = `${baseUrl}&origin=${latitude},${longitude}&destination=${destination}`;
          window.open(url, "_blank", "noopener,noreferrer");
        },
        (error) => {
          console.warn("Geolocation error", error);
          // fallback: тільки destination
          const url = `${baseUrl}&destination=${destination}`;
          window.open(url, "_blank", "noopener,noreferrer");
        }
      );
    } else {
      const url = `${baseUrl}&destination=${destination}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (!onClose) return;

    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="place-card" ref={cardRef}>
      <button
        type="button"
        className="place-card-close"
        onClick={() => onClose && onClose()}
        aria-label="Закрити"
      >
        ✕
      </button>

      <div className="place-card__content">
        <PhotoGrid photos={place.photos} />

        <PlaceInfo
          name={place.name}
          description={[
            place.description,
            place.adress,
            place.contacts,
            place.workingHours,
          ]}
        />

        <div className="rating-section">
          <h3>Оцінка</h3>
          <Rating
            rating={userRating ?? avgRating}
            onChange={handleRatingChange}
            disabled={false}
          />
          <p className="rating-info">
            Середня оцінка: {avgRating.toFixed(1)} ({ratingsCount} голосів)
          </p>
          {userRating && <p className="rating-info">Ваша оцінка: {userRating}</p>}
          {ratingError && <p className="error">{ratingError}</p>}
        </div>

        <button
          type="button"
          className="favorite-btn btn"
          onClick={handleToggleFavorite}
        >
          {isFavorite ? "Прибрати з обраних" : "Додати в обрані"}
        </button>
        {favError && <p className="error">{favError}</p>}

        <div className="route-section">
          <button type="button" className="route-btn btn" onClick={handleOpenRoute}>
            Прокласти маршрут
          </button>
          {routeError && <p className="error">{routeError}</p>}
        </div>

        <div className="comments-section">
          <h3>Коментарі</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Залишити коментар"
            />
            <button type="submit" className="comment-submit-btn btn">
              Відправити
            </button>
          </form>
          {error && <p className="error">{error}</p>}
          <ul>
            {comments.map((comment) => (
              <li key={comment._id}>
                <p>{comment.text}</p>
                <small>
                  {comment.user?.name} ({comment.user?.email}) -{" "}
                  {new Date(comment.date).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

};

export default PlaceCard;
