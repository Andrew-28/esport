import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SideBar } from "./containers/SideBar";
import { Navigation } from "./containers/Navigation";
import { Home } from "./containers/Home";
import { Footer } from "./containers/Footer";
import { Place } from "@mui/icons-material";

function App() {
  return (
    <div className="App">
      <Navigation />
      <div className="contentContainer">
        <Home />
      </div>
      <div>
        <Footer id="footer" />
      </div>
    </div>
  );
}

export default App;
