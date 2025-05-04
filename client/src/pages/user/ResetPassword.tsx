import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "@/services/authApi";
import { InputField } from "@/components/InputField";
import { Lock, Eye, EyeOff } from "lucide-react";
import { PasswordStrength } from "@/components/PasswordStrength";

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = searchParams.get("token");

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid or expired reset link. Please request a new one.");
    }
  }, [token]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      navigate("/login", { state: { message: "Password reset successfully!" } });
    }
  }, [isSuccess, navigate]);

  const validateField = (name: keyof typeof formData, value: string): string => {
    if (name === "password") {
      if (!value) return "Password is required";
      if (value.length < 8) return "Must be at least 8 characters";
    } else if (name === "confirmPassword") {
      if (!value) return "Please confirm your password";
      if (value !== formData.password) return "Passwords do not match";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name as keyof typeof formData, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name as keyof typeof formData, formData[name as keyof typeof formData]) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newTouched = { password: true, confirmPassword: true };
    const newErrors = {
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    };

    setTouched(newTouched);
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(error => error);
    if (hasErrors || !token) return;

    try {
      await resetPassword({ token, password: formData.password }).unwrap();
    } catch (err) {
      setErrorMessage(
        (err as { data?: { message?: string } })?.data?.message || 
        "Password reset failed. The link may have expired."
      );
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-[350px] bg-white border border-gray-300 p-8 rounded-md shadow text-center">
          <img src="/logo/hive-logo.png" alt="Hive Logo" className="w-24 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Invalid Reset Link</h2>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button
            onClick={() => navigate("/forget-password")}
            className="text-blue-600 hover:underline"
          >
            Request a new reset link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-[350px] bg-white border border-gray-300 p-8 rounded-md shadow">
        <div className="text-center">
          <img src="/logo/hive-logo.png" alt="Hive Logo" className="w-24 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Reset Your Password</h2>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-4 text-center">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <InputField
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="New password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            icon={<Lock size={18} />}
            error={touched.password ? errors.password : ""}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {formData.password && <PasswordStrength password={formData.password} />}

          <InputField
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            icon={<Lock size={18} />}
            error={touched.confirmPassword ? errors.confirmPassword : ""}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Reset password"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};