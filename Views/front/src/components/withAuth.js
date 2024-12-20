import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function withAuth(Component) {
    return function AuthenticatedComponent(props) {
        const navigate = useNavigate();

        useEffect(() => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
            }
        }, [navigate]);

        return <Component {...props} />;
    };
}

export default withAuth;
