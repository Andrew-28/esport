import "./App.css";
import {
  BrowserRouter,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { SideBar } from "./containers/SideBar";
import { Navigation } from "./containers/Navigation";
import { Home } from "./containers/Home";
import { Footer } from "./containers/Footer";
import { Place } from "@mui/icons-material";
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
