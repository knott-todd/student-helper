import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppContext } from "../AppContext";

// Layout route for pages that need a signed-in user. App only renders routes
// once GET /me has answered, so "no user" here really means signed out: show the landing page.
// This is navigation, not access control: the backend enforces the session.
const RequireAuth = () => {
    const global = useContext(AppContext);
    return global.user ? <Outlet /> : <Navigate to="/" replace />;
};

export default RequireAuth;
