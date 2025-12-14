// AdminUsersPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminUsersPage.module.css";
import { API_BASE_URL } from "../../../config/apiConfig";
import { useAuth } from "../../Navigation/AuthContext";

const ROLE_FILTER = {
    ALL: "all",
    USER: "user",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
};

const AdminUsersPage = () => {
    const { user: currentUser } = useAuth();
    const isSuperadmin = currentUser?.role === "superadmin";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState(ROLE_FILTER.ALL);

    const [activeId, setActiveId] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    const token = localStorage.getItem("token");

    // ====== Завантаження списку користувачів ======
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");

            try {
                if (!token) {
                    setError("Немає токена авторизації (увійдіть як адмін).");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token,
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.msg || "Не вдалося завантажити користувачів.");
                    setUsers([]);
                } else {
                    setUsers(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Error fetching admin users:", err);
                setError("Помилка сервера при завантаженні користувачів.");
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ====== Фільтрація ======
    const filteredUsers = useMemo(() => {
        let list = [...users];

        if (roleFilter === ROLE_FILTER.USER) {
            list = list.filter((u) => u.role === "user");
        } else if (roleFilter === ROLE_FILTER.ADMIN) {
            list = list.filter((u) => u.role === "admin");
        } else if (roleFilter === ROLE_FILTER.SUPERADMIN) {
            list = list.filter((u) => u.role === "superadmin");
        }

        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter((u) => {
                const s = [u.name, u.email].filter(Boolean).join(" ").toLowerCase();
                return s.includes(q);
            });
        }

        return list.sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
        });
    }, [users, search, roleFilter]);

    // ====== Синхронізація активного користувача / форми ======
    useEffect(() => {
        if (!filteredUsers.length) {
            setActiveId(null);
            setForm(null);
            return;
        }

        const found = filteredUsers.find((u) => u.id === activeId);
        if (found) {
            setForm({ ...found });
        } else {
            const first = filteredUsers[0];
            setActiveId(first.id);
            setForm({ ...first });
        }

        setSaveMessage("");
    }, [filteredUsers, activeId]);

    const handleSelectUser = (user) => {
        setActiveId(user.id);
        setForm({ ...user });
        setSaveMessage("");
    };

    const handleRoleChange = (e) => {
        const { value } = e.target;
        setForm((prev) => ({ ...prev, role: value }));
    };

    const handleBlockedToggle = (e) => {
        const { checked } = e.target;
        setForm((prev) => ({ ...prev, isBlocked: checked }));
    };

    const handleSave = async () => {
        if (!form) return;
        if (!token) {
            alert("Немає токена авторизації.");
            return;
        }

        setSaving(true);
        setSaveMessage("");

        try {
            const res = await fetch(
                `${API_BASE_URL}/api/admin/users/${form.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-auth-token": token,
                    },
                    body: JSON.stringify({
                        role: form.role,
                        isBlocked: form.isBlocked,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                const msg =
                    data.msg ||
                    (data.errors && data.errors[0]?.msg) ||
                    "Не вдалося зберегти зміни користувача.";
                alert(msg);
                return;
            }

            // оновлюємо локально
            setUsers((prev) =>
                prev.map((u) => (u.id === data.id ? data : u))
            );
            setForm({ ...data });
            setSaveMessage("Зміни збережено.");
        } catch (err) {
            console.error("Error saving user changes:", err);
            alert("Помилка сервера при збереженні користувача.");
        } finally {
            setSaving(false);
        }
    };

    const totalAdmins = useMemo(
        () => users.filter((u) => u.role === "admin").length,
        [users]
    );
    const totalUsers = useMemo(
        () => users.filter((u) => u.role === "user").length,
        [users]
    );
    const totalBlocked = useMemo(
        () => users.filter((u) => u.isBlocked).length,
        [users]
    );

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h2 className={styles.pageTitle}>Користувачі</h2>
                    <p className={styles.pageSubtitle}>
                        Перегляд списку користувачів, зміна ролей та блокування доступу.
                    </p>
                </div>
            </header>

            <div className={styles.layout}>
                {/* Ліва колонка: список */}
                <section className={styles.left}>
                    <div className={styles.summaryRow}>
                        <span>Всього: {users.length}</span>
                        <span>Адмінів: {totalAdmins}</span>
                        <span>Звичайних: {totalUsers}</span>
                        <span>Заблоковано: {totalBlocked}</span>
                    </div>

                    <div className={styles.searchBlock}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Пошук за ПІБ або e-mail..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterRow}>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${roleFilter === ROLE_FILTER.ALL ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setRoleFilter(ROLE_FILTER.ALL)}
                        >
                            Усі
                        </button>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${roleFilter === ROLE_FILTER.USER ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setRoleFilter(ROLE_FILTER.USER)}
                        >
                            Звичайні
                        </button>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${roleFilter === ROLE_FILTER.ADMIN ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setRoleFilter(ROLE_FILTER.ADMIN)}
                        >
                            Адміни
                        </button>
                        <button
                            type="button"
                            className={`${styles.filterChip} ${roleFilter === ROLE_FILTER.SUPERADMIN ? styles.filterChipActive : ""
                                }`}
                            onClick={() => setRoleFilter(ROLE_FILTER.SUPERADMIN)}
                        >
                            Супер-адміни
                        </button>
                    </div>


                    <div className={styles.listCard}>
                        {loading ? (
                            <p className={styles.muted}>Завантаження користувачів…</p>
                        ) : filteredUsers.length === 0 ? (
                            <p className={styles.muted}>
                                Немає користувачів за поточними фільтрами.
                            </p>
                        ) : (
                            <ul className={styles.list}>
                                {filteredUsers.map((u) => (
                                    <li
                                        key={u.id}
                                        className={`${styles.listItem} ${u.id === activeId ? styles.listItemActive : ""
                                            }`}
                                        onClick={() => handleSelectUser(u)}
                                    >
                                        <div className={styles.listTitleRow}>
                                            <span className={styles.listTitle}>{u.name}</span>
                                            <span
                                                className={`${styles.roleBadge} ${u.role === "admin"
                                                    ? styles.roleBadgeAdmin
                                                    : styles.roleBadgeUser
                                                    }`}
                                            >
                                                {u.role}
                                            </span>
                                        </div>
                                        <div className={styles.listMetaRow}>
                                            <span className={styles.email}>{u.email}</span>
                                            {u.isBlocked && (
                                                <span className={styles.blockedBadge}>
                                                    Заблоковано
                                                </span>
                                            )}
                                        </div>
                                        {u.createdAt && (
                                            <div className={styles.listDateRow}>
                                                Зареєстровано:{" "}
                                                {new Date(u.createdAt).toLocaleString("uk-UA")}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                </section>

                {/* Права колонка: деталі користувача */}
                <section className={styles.right}>
                    {form ? (
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Деталі користувача</h3>

                            <div className={styles.infoRow}>
                                <span className={styles.label}>Ім&apos;я:</span>
                                <span className={styles.value}>{form.name || "—"}</span>
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.label}>E-mail:</span>
                                <span className={styles.value}>{form.email || "—"}</span>
                            </div>

                            {isSuperadmin && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Роль:</span>
                                    <select
                                        className={styles.select}
                                        value={form.role}
                                        onChange={handleRoleChange}
                                        disabled={!isSuperadmin}   // 🔑 тільки супер-адмін може змінювати
                                    >
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                        <option value="superadmin">superadmin</option>
                                    </select>
                                </div>)}

                            <div className={styles.infoRow}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={form.isBlocked}
                                        onChange={handleBlockedToggle}
                                    />
                                    Заблокувати користувача
                                </label>
                            </div>

                            {form.createdAt && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Зареєстровано:</span>
                                    <span className={styles.value}>
                                        {new Date(form.createdAt).toLocaleString("uk-UA")}
                                    </span>
                                </div>
                            )}

                            <div className={styles.actionsRow}>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Збереження..." : "Зберегти зміни"}
                                </button>
                            </div>

                            {saveMessage && (
                                <p className={styles.success}>{saveMessage}</p>
                            )}
                        </div>
                    ) : (
                        <div className={styles.placeholder}>
                            <p>Оберіть користувача зліва, щоб переглянути деталі.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminUsersPage;
