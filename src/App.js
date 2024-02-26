import "./App.css";
import { Navigation } from "./containers/Navigation";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { SideBar } from "./containers/SideBar";
import { Map } from "./components/Map";
import { Footer } from "./containers/Footer";

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
      </Router>
      <div className="contentContainer">
        <div>
          <SideBar />
        </div>
        {/* <div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d169324.3891045453!2d34.83555102113675!3d48.46240852871822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40dbe303fd08468f%3A0xa1cf3d5f2c11aba!2z0JTQvdGW0L_RgNC-LCDQlNC90ZbQv9GA0L7Qv9C10YLRgNC-0LLRgdGM0LrQsCDQvtCx0LvQsNGB0YLRjCwgNDkwMDA!5e0!3m2!1suk!2sua!4v1707843662651!5m2!1suk!2sua"
            width="800"
            height="684"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div> */}
      </div>
      <div>
        <Footer id="Footer" />
      </div>
    </div>
  );
}

export default App;
