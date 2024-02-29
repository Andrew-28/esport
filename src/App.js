import "./App.css";
import { Navigation } from "./containers/Navigation";
import { Footer } from "./containers/Footer";
import AppRoutes from "./components/Routes/AppRoutes";

function App() {
  return (
    <div className="App">
      <Navigation />
      <div className="contentContainer">
        <AppRoutes />
      </div>
      <div>
        <Footer id="footer" />
      </div>
    </div>
  );
}

export default App;
