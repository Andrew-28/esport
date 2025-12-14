import React, { useEffect, useState } from "react";
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
        if (!res.ok) {
          throw new Error("Не вдалося завантажити новини");
        }
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Сталася помилка при завантаженні новин");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="news-container">Завантаження новин...</div>;
  }

  return (
    <div className="news-container">
      <h2>Новини</h2>
      {error && <p className="news-error">{error}</p>}

      {items.length === 0 && !error && <p>Поки що немає новин.</p>}

      <div className="news-list">
        {items.map((item) => (
          <article key={item._id} className="news-card">
            {item.imageUrl && (
              <div className="news-image-wrapper">
                <img src={item.imageUrl} alt={item.title} />
              </div>
            )}
            <div className="news-content">
              <h3>{item.title}</h3>
              {item.category && (
                <span className="news-category">{item.category}</span>
              )}
              <p className="news-date">
                {new Date(
                  item.publishedAt || item.createdAt
                ).toLocaleString()}
              </p>
              {item.excerpt && (
                <p className="news-excerpt">{item.excerpt}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default News;
