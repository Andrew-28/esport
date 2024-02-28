import { Routes, Route } from "react-router-dom";
import { Login } from "../../containers/Authorization/Login";
import { Home } from "../../containers/Home";
import { Registration } from "../../containers/Authorization/Registration";

const AppRoutes = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
    </Routes>
  );
};
export default AppRoutes;
