import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const IndexRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
};