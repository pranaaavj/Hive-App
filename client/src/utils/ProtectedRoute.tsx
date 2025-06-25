import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const navigate = useNavigate();
  
    useEffect(() => {
      const accessToken = localStorage.getItem("accessToken");
      const adminAccess = localStorage.getItem("adminAccessToken")
      if (!accessToken) {
        navigate("/login");
      }else if(!adminAccess){
        navigate('/adminlogin')
      }
    }, [navigate]);
    
  
    return <>{children}</>;
  };
  