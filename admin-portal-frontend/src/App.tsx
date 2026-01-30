import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clinics from "./pages/Clinics";
import Doctors from "./pages/Doctors";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <span className="spinner spinner-lg" aria-hidden />
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clinics"
      element={
        <ProtectedRoute>
          <Layout>
            <Clinics />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/doctors"
      element={
        <ProtectedRoute>
          <Layout>
            <Doctors />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => <AppRoutes />;

export default App;
