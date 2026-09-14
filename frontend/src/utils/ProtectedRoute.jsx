import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // ==========================================
    // Check Login
    // ==========================================

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ==========================================
    // Check Role
    // ==========================================

    if (allowedRole && role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;