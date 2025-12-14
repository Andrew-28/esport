// src/App.jsx
import "./App.css";
import { Navigation } from "./containers/Navigation";
import { Footer } from "./containers/Footer";
import AppRoutes from "./components/Routes/AppRoutes";
import { AuthProvider } from "./containers/Navigation/AuthContext";
import { ThemeProvider } from "./containers/ThemeContext";
import { useLocation } from "react-router-dom";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          {/* Публічна частина */}
          {!isAdminRoute && (
            <>
              {/* Skip link для клавіатурних юзерів */}
              <a href="#main-content" className="skip-link">
                Перейти до основного вмісту
              </a>

              <Navigation />

              <main
                id="main-content"
                className="contentContainer"
                role="main"
                aria-label="Основний вміст сторінки"
              >
                <AppRoutes />
              </main>

              <Footer />
            </>
          )}

          {/* Адмінка: повноекранний свій layout, без Navigation/Footer */}
          {isAdminRoute && <AppRoutes />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
