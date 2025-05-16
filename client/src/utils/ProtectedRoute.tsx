import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const navigate = useNavigate();
  
    useEffect(() => {
      const accessToken = localStorage.getItem("accessToken");
  
      if (!accessToken) {
        navigate("/login");
      }
    }, [navigate]);
  
    return <>{children}</>;
  };
  