import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/apiConfig";
import "./NewsDetails.css";

const NewsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOne = async () => {
      try {
        setLoading(true);
        setError("");

        // Очікуваний endpoint: GET /api/news/:id
        const res = await fetch(`${API_BASE_URL}/api/news/${id}`);
        if (!res.ok) throw new Error("Не вдалося завантажити новину");

        const data = await res.json();
        setItem(data);
      } catch (e) {
        console.error(e);
        setError("Новину не знайдено або сталася помилка");
      } finally {
        setLoading(false);
      }
    };

    fetchOne();
  }, [id]);

  if (loading) return <div className="news-details">Завантаження...</div>;

  if (error || !item) {
    return (
      <div className="news-details">
        <button className="news-back" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <p className="news-error">{error || "Новину не знайдено"}</p>
      </div>
    );
  }

  const date = new Date(item.publishedAt || item.createdAt).toLocaleString();

  // Під різні назви поля з бекенда
  const fullText =
    item.content || item.body || item.text || item.excerpt || "";

  return (
    <div className="news-details">
      <button className="news-back" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <article className="news-article">
        {item.imageUrl && (
          <div className="news-hero">
            <img src={item.imageUrl} alt={item.title} />
          </div>
        )}

        <div className="news-article-head">
          <h1 className="news-article-title">{item.title}</h1>

          <div className="news-meta">
            {item.category && <span className="news-badge">{item.category}</span>}
            <span className="news-meta-date">{date}</span>
          </div>
        </div>

        <div className="news-article-body">
          {/* якщо з бекенда приходить plain text */}
          {String(fullText)
            .split("\n")
            .filter(Boolean)
            .map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
        </div>
      </article>
    </div>
  );
};

export default NewsDetails;
