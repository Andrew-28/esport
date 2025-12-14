// src/containers/Admin/AdminFeedbackPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminFeedbackPage.module.css";
import { API_BASE_URL } from "../../../config/apiConfig";

const FEEDBACK_TYPE = {
    ALL: "all",
    COMMENTS: "comments",
    REVIEWS: "reviews",
};

const AdminFeedbackPage = () => {
    const [comments, setComments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [typeFilter, setTypeFilter] = useState(FEEDBACK_TYPE.ALL);
    const [search, setSearch] = useState("");

    const [activeId, setActiveId] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // завантаження даних
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Немає токена авторизації (зайдіть як адмін).");
                    setLoading(false);
                    return;
                }

                const [commentsRes, reviewsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/comments/admin/all?limit=300`, {
                        headers: {
                            "Content-Type": "application/json",
                            "x-auth-token": token,
                        },
                    }),
                    fetch(`${API_BASE_URL}/api/reviews/admin?limit=300`, {
                        headers: {
                            "Content-Type": "application/json",
                            "x-auth-token": token,
                        },
                    }),
                ]);

                const commentsData = await commentsRes.json();
                const reviewsData = await reviewsRes.json();

                if (!commentsRes.ok) {
                    throw new Error(
                        commentsData.msg || "Не вдалося завантажити коментарі"
                    );
                }
                if (!reviewsRes.ok) {
                    throw new Error(
                        reviewsData.msg || "Не вдалося завантажити оцінки"
                    );
                }

                // commentsData та reviewsData — вже в DTO-форматі
                setComments(Array.isArray(commentsData) ? commentsData : []);
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            } catch (err) {
                console.error("AdminFeedbackPage fetch error:", err);
                setError(err.message || "Помилка при завантаженні відгуків.");
                setComments([]);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // комбінуємо + фільтруємо
    const combinedList = useMemo(() => {
        const allItems = [
            ...comments.map((c) => ({ ...c, kind: "comment" })),
            ...reviews.map((r) => ({ ...r, kind: "review" })),
        ];

        const filteredByType = allItems.filter((item) => {
            if (typeFilter === FEEDBACK_TYPE.COMMENTS) return item.kind === "comment";
            if (typeFilter === FEEDBACK_TYPE.REVIEWS) return item.kind === "review";
            return true;
        });

        const q = search.trim().toLowerCase();

        const filteredBySearch = filteredByType.filter((item) => {
            if (!q) return true;

            const s = [
                item.kind === "comment" ? item.text : "",
                item.kind === "review" ? `оцінка ${item.rating}` : "",
                item.user?.name,
                item.user?.email,
                item.place?.name,
                item.place?.sportName,
                item.placeLegacyId,
            ]
                .filter(Boolean)
                .join(" ")
                .toString()
                .toLowerCase();

            return s.includes(q);
        });

        // сортуємо по даті (новіші згори)
        return filteredBySearch.sort((a, b) => {
            const da = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const db = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return db - da;
        });
    }, [comments, reviews, typeFilter, search]);

    useEffect(() => {
        if (!combinedList.length) {
            setActiveId(null);
            setActiveItem(null);
            return;
        }
        // якщо активний елемент випав, вибираємо перший у списку
        const stillExists = combinedList.find((i) => i._id === activeId);
        if (stillExists) {
            setActiveItem(stillExists);
        } else {
            setActiveId(combinedList[0]._id);
            setActiveItem(combinedList[0]);
        }
    }, [combinedList, activeId]);

    const handleSelectItem = (item) => {
        setActiveId(item._id);
        setActiveItem(item);
    };

    const handleDelete = async () => {
        if (!activeItem) return;

        const confirmText =
            activeItem.kind === "comment"
                ? "Видалити цей коментар?"
                : "Видалити цю оцінку? Рейтинг місця буде перераховано.";

        if (!window.confirm(confirmText)) return;

        setDeleteLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Немає токена авторизації.");
                return;
            }

            if (activeItem.kind === "comment") {
                const res = await fetch(
                    `${API_BASE_URL}/api/comments/admin/${activeItem._id}`,
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
                    alert(data.msg || "Не вдалося видалити коментар");
                    return;
                }
                // прибираємо з локального стейту
                setComments((prev) => prev.filter((c) => c._id !== activeItem._id));
            } else {
                const res = await fetch(
                    `${API_BASE_URL}/api/reviews/admin/${activeItem._id}`,
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
                    alert(data.msg || "Не вдалося видалити оцінку");
                    return;
                }
                setReviews((prev) => prev.filter((r) => r._id !== activeItem._id));
            }

            setActiveItem(null);
            setActiveId(null);
        } catch (err) {
            console.error("Delete feedback error", err);
            alert("Помилка сервера при видаленні.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Коментарі та оцінки</h2>
                    <p className={styles.pageSubtitle}>
                        Перегляд і модерація користувацьких коментарів та рейтингів
                        локацій.
                    </p>
                </div>
            </header>

            <div className={styles.layout}>
                {/* Ліва колонка: фільтри + список */}
                <section className={styles.left}>
                    <div className={styles.searchBlock}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Пошук за текстом, юзером або місцем..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterRow}>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${typeFilter === FEEDBACK_TYPE.ALL ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setTypeFilter(FEEDBACK_TYPE.ALL)}
                        >
                            Всі ({combinedList.length})
                        </button>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${typeFilter === FEEDBACK_TYPE.COMMENTS
                                    ? styles.filterChipActive
                                    : ""
                                }`}
                            onClick={() => setTypeFilter(FEEDBACK_TYPE.COMMENTS)}
                        >
                            Лише коментарі (
                            {combinedList.filter((i) => i.kind === "comment").length})
                        </button>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${typeFilter === FEEDBACK_TYPE.REVIEWS
                                    ? styles.filterChipActive
                                    : ""
                                }`}
                            onClick={() => setTypeFilter(FEEDBACK_TYPE.REVIEWS)}
                        >
                            Лише оцінки (
                            {combinedList.filter((i) => i.kind === "review").length})
                        </button>
                    </div>

                    <div className={styles.listCard}>
                        {loading ? (
                            <p className={styles.muted}>Завантаження…</p>
                        ) : combinedList.length === 0 ? (
                            <p className={styles.muted}>Немає відгуків за поточними фільтрами.</p>
                        ) : (
                            <ul className={styles.list}>
                                {combinedList.map((item) => (
                                    <li
                                        key={item._id}
                                        className={`${styles.listItem} ${item._id === activeId ? styles.listItemActive : ""
                                            }`}
                                        onClick={() => handleSelectItem(item)}
                                    >
                                        <div className={styles.listTitleRow}>
                                            <span className={styles.listTitle}>
                                                {item.place?.name || `Місце #${item.placeLegacyId}`}
                                            </span>
                                            <span
                                                className={`${styles.kindBadge} ${item.kind === "comment"
                                                        ? styles.kindComment
                                                        : styles.kindReview
                                                    }`}
                                            >
                                                {item.kind === "comment" ? "Коментар" : "Оцінка"}
                                            </span>
                                        </div>
                                        <div className={styles.listMetaRow}>
                                            {item.kind === "comment" ? (
                                                <span className={styles.commentPreview}>
                                                    {item.text?.slice(0, 50) || ""}
                                                    {item.text && item.text.length > 50 && "…"}
                                                </span>
                                            ) : (
                                                <span className={styles.ratingPreview}>
                                                    ⭐ {item.rating}
                                                </span>
                                            )}
                                        </div>
                                        <div className={styles.listUserRow}>
                                            {item.user ? (
                                                <>
                                                    {item.user.name} ({item.user.email})
                                                </>
                                            ) : (
                                                "Користувач невідомий"
                                            )}
                                        </div>
                                        <div className={styles.listDateRow}>
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleString("uk-UA")
                                                : "—"}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                </section>

                {/* Права колонка: деталі */}
                <section className={styles.right}>
                    {activeItem ? (
                        <>
                            <div className={styles.detailsHeader}>
                                <h3 className={styles.detailsTitle}>
                                    {activeItem.place?.name ||
                                        `Місце #${activeItem.placeLegacyId}`}
                                </h3>
                                <p className={styles.detailsSubtitle}>
                                    {activeItem.place?.sportName || "Вид спорту не вказано"}
                                </p>
                            </div>

                            <div className={styles.card}>
                                <h4 className={styles.cardTitle}>Інформація про відгук</h4>
                                <p>
                                    <strong>Тип:</strong>{" "}
                                    {activeItem.kind === "comment" ? "Коментар" : "Оцінка"}
                                </p>

                                {activeItem.kind === "review" && (
                                    <p>
                                        <strong>Оцінка:</strong> ⭐ {activeItem.rating}
                                    </p>
                                )}

                                {activeItem.kind === "comment" && (
                                    <div className={styles.commentBox}>
                                        <strong>Текст:</strong>
                                        <p>{activeItem.text}</p>
                                    </div>
                                )}

                                <p>
                                    <strong>Користувач:</strong>{" "}
                                    {activeItem.user
                                        ? `${activeItem.user.name} (${activeItem.user.email})`
                                        : "—"}
                                </p>

                                <p>
                                    <strong>Створено:</strong>{" "}
                                    {activeItem.createdAt
                                        ? new Date(activeItem.createdAt).toLocaleString("uk-UA")
                                        : "—"}
                                </p>
                            </div>

                            <div className={styles.card}>
                                <h4 className={styles.cardTitle}>Дії модератора</h4>
                                <button
                                    type="button"
                                    className={styles.dangerButton}
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                >
                                    {deleteLoading ? "Видалення…" : "Видалити"}
                                </button>
                                <p className={styles.mutedSmall}>
                                    Для оцінок після видалення рейтинг локації автоматично
                                    перераховується.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Оберіть коментар або оцінку зліва, щоб переглянути деталі.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default AdminFeedbackPage;
