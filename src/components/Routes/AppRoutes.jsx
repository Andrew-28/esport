// src/components/Routes/AppRoutes.jsx
import { Routes, Route } from "react-router-dom";
import { Login } from "../../containers/Authorization/Login";
import { Home } from "../../containers/Home";
import { Registration } from "../../containers/Authorization/Registration";
import { SuggestPlace } from "../../containers/SuggestPlace";
import News from "../../containers/News/News";
import NewsDetails from "../../containers/News/NewsDetails";
import Profile from "../../containers/Profile/Profile";

// нові імпорти:
import AdminLayout from "../../containers/Admin/AdminLayout";
import AdminDashboard from "../../containers/Admin/AdminDashboard";
import AdminSuggestionsPage from "../../containers/Admin/Suggestions/AdminSuggestionsPage";
import AdminRoute from "./AdminRoute"; // ProtectedRoute для admin
import AdminPlacesPage from "../../containers/Admin/AdminPlacesPage/AdminPlacesPage";
import AdminSportsPage from "../../containers/Admin/AdminSportsPage/AdminSportsPage";
import AdminFeedbackPage from "../../containers/Admin/AdminFeedbackPage/AdminFeedbackPage";
import AdminNewsPage from "../../containers/Admin/AdminNewsPage/AdminNewsPage";
import AdminUsersPage from "../../containers/Admin/AdminUsersPage/AdminUsersPage";

import RequireAdmin from "./RequireAdmin";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Публічна частина */}
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/suggest-place" element={<SuggestPlace />} />
      <Route path="/news" element={<News />} />
      <Route path="/news/:id" element={<NewsDetails />} />
      <Route path="/profile" element={<Profile />} />

      {/* адмінка */}
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        {/* /admin */}
        <Route index element={<AdminDashboard />} />

        {/* /admin/suggestions */}
        <Route path="suggestions" element={<AdminSuggestionsPage />} />

        <Route path="places" element={<AdminPlacesPage />} />

        <Route path="sports" element={<AdminSportsPage />} />

        <Route path="comments" element={<AdminFeedbackPage />} />

        <Route path="news" element={<AdminNewsPage />} />

        <Route path="users" element={<AdminUsersPage />} />

        {/* далі додамо: places, sports, comments, news, users */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
