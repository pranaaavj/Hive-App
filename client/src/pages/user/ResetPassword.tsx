import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { InputField } from "@/components/InputField";
import { useResetPasswordMutation } from "@/services/authApi";
import { PasswordStrength } from "@/components/PasswordStrength";

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    let hasErrors = false;

    ["password", "confirmPassword"].forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field as keyof typeof errors] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({ password: true, confirmPassword: true });

    if (!hasErrors) {
      if (!token) {
        setErrors({ password: "Invalid or missing reset token" });
        return;
      }

      try {
        await resetPassword({ token, password: formData.password }).unwrap();
        navigate("/login");
      } catch (err) {
        setErrors({ password: "Reset failed. Try again." });
      }
    }
  };

  return (
    <div className="flex-col flex max-h-screen w-full items-center justify-center">
      <div className="w-[350px] bg-white rounded-[2px] border-gray-400 border space-y-8 mt-8 p-8">
        <div className="text-center flex items-center flex-col">
          <img className="w-30" src="/logo/hive-logo.png" alt="Hive Logo" />
          <p className="mt-3 font-bold text-gray-600">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="New password"
            icon={<Lock size={18} className="text-gray-400" />}
            error={touched.password ? errors.password : undefined}
            suffix={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
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
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Confirm password"
            icon={<Lock size={18} className="text-gray-400" />}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-black py-3 px-4 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
