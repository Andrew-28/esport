import React, { useState, useRef, useEffect } from "react";
import style from "./Navigation.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useTheme } from "../ThemeContext";

const Navigation = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLike = user?.role === "admin" || user?.role === "superadmin";

  // ---------- ТЕМА (з контексту) ----------
  const { theme, toggleTheme } = useTheme();

  // ---------- ЮЗЕР-МЕНЮ ----------
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const closeUserMenu = () => setIsUserMenuOpen(false);

  // клік поза меню + Esc
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        closeUserMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleAnchorClick = (event, anchorId) => {
    event.preventDefault();
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    closeUserMenu();
    logout();
    navigate("/");
  };

  const goToProfile = () => {
    closeUserMenu();
    navigate("/profile");
  };

  const goToFavorites = () => {
    closeUserMenu();
    navigate("/profile#favorites");
  };

  const goToSuggestions = () => {
    closeUserMenu();
    navigate("/profile#suggestions");
  };

  const goToAdmin = () => {
    closeUserMenu();
    navigate("/admin");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "?";

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className={style.navigation}>
      <Link to="/" className={style.title}>
        єСпорт
      </Link>

      <div className={style.btnGroup}>
        <a
          onClick={(e) => handleAnchorClick(e, "footer")}
          className={`${style.btn} ${
            location.hash === "#footer" ? style.btnActive : ""
          }`}
          href="#footer"
        >
          Про нас
        </a>

        <Link
          to="/news"
          className={`${style.btn} ${
            isActivePath("/news") ? style.btnActive : ""
          }`}
        >
          Новини
        </Link>

        {/* {isAdminLike && (
          <Link
            to="/admin"
            className={`${style.btn} ${
              location.pathname.startsWith("/admin") ? style.btnActive : ""
            }`}
          >
            Адмін-панель
          </Link>
        )} */}

        {isAuthenticated && (
          <Link
            to="/suggest-place"
            className={`${style.btn} ${
              isActivePath("/suggest-place") ? style.btnActive : ""
            }`}
          >
            Запропонувати місце
          </Link>
        )}

        {!isLoading && (
          <>
            {isAuthenticated ? (
              <div className={style.userMenuWrapper} ref={userMenuRef}>
                <button
                  type="button"
                  className={style.userChip}
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                >
                  <div className={style.userAvatar}>{userInitials}</div>
                  <div className={style.userChipText}>
                    <span className={style.userChipName}>{user?.name}</span>
                    {user?.role === "admin" && (
                      <span className={style.userChipRole}>admin</span>
                    )}
                    {user?.role === "superadmin" && (
                      <span className={style.userChipRole}>superadmin</span>
                    )}
                  </div>
                  <span
                    className={`${style.userChipArrow} ${
                      isUserMenuOpen ? style.userChipArrowOpen : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className={style.userMenu}>
                    <button
                      type="button"
                      className={style.userMenuItem}
                      onClick={goToProfile}
                    >
                      Профіль
                    </button>
                    <button
                      type="button"
                      className={style.userMenuItem}
                      onClick={goToFavorites}
                    >
                      Мої обрані
                    </button>
                    <button
                      type="button"
                      className={style.userMenuItem}
                      onClick={goToSuggestions}
                    >
                      Мої пропозиції
                    </button>

                    <div className={style.userMenuDivider} />

                    {isAdminLike && (
                      <button
                        type="button"
                        className={style.userMenuItem}
                        onClick={goToAdmin}
                      >
                        Адмін-панель
                      </button>
                    )}

                    <button
                      type="button"
                      className={`${style.userMenuItem} ${style.userMenuLogout}`}
                      onClick={handleLogout}
                    >
                      Вийти з системи
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`${style.btn} ${
                  isActivePath("/login") ? style.btnActive : ""
                }`}
              >
                Авторизуватися
              </Link>
            )}
          </>
        )}

        {/* Перемикач теми */}
        <button
          type="button"
          className={style.themeToggleBtn}
          onClick={toggleTheme}
        >
          <span className={style.themeIcon}>
            {theme === "light" ? "🌙" : "🌞"}
          </span>
          <span className={style.themeLabel}>
            {theme === "light" ? "Темна" : "Світла"}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
