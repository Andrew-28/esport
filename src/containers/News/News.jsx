import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config/apiConfig";
import "./News.css";

const News = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/news`);
        if (!res.ok) throw new Error("Не вдалося завантажити новини");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Сталася помилка при завантаженні новин");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="news-container">Завантаження новин...</div>;

  return (
    <div className="news-container">
      <div className="news-header">
        <h2>Новини</h2>
      </div>

      {error && <p className="news-error">{error}</p>}
      {items.length === 0 && !error && <p>Поки що немає новин.</p>}

      <div className="news-list">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/news/${item._id}`}
            className="news-card"
            aria-label={`Відкрити новину: ${item.title}`}
          >
            <div className="news-thumb">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} loading="lazy" />
              ) : (
                <div className="news-thumb-placeholder" />
              )}
            </div>

            <div className="news-content">
              <div className="news-topline">
                <h3 className="news-title">{item.title}</h3>

                {item.category && (
                  <span className="news-category">{item.category}</span>
                )}
              </div>

              <p className="news-date">
                {new Date(item.publishedAt || item.createdAt).toLocaleString()}
              </p>

              <p className="news-excerpt">
                {item.excerpt || item.text?.slice(0, 160) || "Читати детальніше…"}
              </p>

              <span className="news-readmore">Читати →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default News;
