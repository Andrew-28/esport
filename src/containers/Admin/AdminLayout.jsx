// src/containers/Admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../Navigation/AuthContext";
import { useTheme } from "../ThemeContext"; // можна реюзнути вже існуючу тему
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToPublicSite = () => {
    navigate("/");
  };

  return (
    <div className={styles.adminRoot}>
      {/* Лівий сайдбар */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={styles.logoButton}
            onClick={goToPublicSite}
          >
            <span className={styles.logo}>єСпорт</span>
            <span className={styles.logoTag}>Admin</span>
          </button>
        </div>

        <nav className={styles.nav}>
          <NavLink
            end
            to="/admin"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Дешборд
          </NavLink>

          <NavLink
            to="/admin/suggestions"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Пропозиції місць
          </NavLink>

          <NavLink
            to="/admin/places"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Локації
          </NavLink>

          <NavLink
            to="/admin/sports"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Види спорту
          </NavLink>

          <NavLink
            to="/admin/comments"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Коментарі та оцінки
          </NavLink>

          <NavLink
            to="/admin/news"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Новини
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Користувачі
          </NavLink>

          {user?.role === "superadmin" && (
            <div className={styles.superadminBanner}>
              Ви увійшли як <strong>superadmin</strong>.
              Будьте обережні при зміні ролей та блокуванні користувачів.
            </div>
          )}
        </nav>
      </aside>

      {/* Права частина: топбар + контент */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Адмін-панель</h1>
            <p className={styles.headerSubtitle}>
              Модерація контенту та керування довідниками платформи.
            </p>
          </div>

          <div className={styles.headerRight}>
            {/* Перемикач теми через ThemeContext */}
            <button
              type="button"
              className={styles.themeToggleBtn}
              onClick={toggleTheme}
            >
              <span className={styles.themeIcon}>
                {theme === "light" ? "🌙" : "🌞"}
              </span>
              <span className={styles.themeLabel}>
                {theme === "light" ? "Темна" : "Світла"}
              </span>
            </button>

            {/* Інфо про адміна */}
            <div className={styles.userChip}>
              <div className={styles.userAvatar}>
                {user?.name
                  ? user.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join("")
                  : "U"}
              </div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userRole}>
                  {user?.role === "superadmin"
                    ? "superadmin"
                    : user?.role === "admin"
                      ? "admin"
                      : "user"}
                </span>
              </div>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
              >
                Вийти
              </button>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          {/* Тут рендеряться всі конкретні адмін-сторінки */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
