import "./App.css";
import { Navigation } from "./containers/Navigation";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SideBar } from "./containers/SideBar";
import { Map } from "./components/Map";
import { Footer } from "./containers/Footer";
import { Login } from "./containers/Authorization/Login";
import { Home } from "./containers/Home";

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Routes>
          {/* <Link to="/Login" className={style.btn}>
              Авторизуватися
            </Link> */}
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
      </Router>
      <div>
        <Footer id="footer" />
      </div>
    </div>
  );
}

export default App;
