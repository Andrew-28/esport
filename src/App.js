import "./App.css";
import { Navigation } from "./containers/Navigation";
import { Footer } from "./containers/Footer";
import AppRoutes from "./components/Routes/AppRoutes";
import { AuthProvider } from "./containers/Navigation/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navigation />
        <div className="contentContainer">
          <AppRoutes />
        </div>
        <div>
          <Footer id="footer" />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
