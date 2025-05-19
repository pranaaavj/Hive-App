import React, { useState } from "react";
import { RegisterFormData } from "@/types/auth";
import { InputField } from "@/components/InputField";
import { PasswordStrength } from "@/components/PasswordStrength";
import { User, Lock, EyeOff, Eye, Mail, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "@/services/authApi";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateField = (
    field: keyof RegisterFormData,
    value: string
  ): string => {
    switch (field) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return "";
      case "email":
        return !/^\S+@\S+\.\S+$/.test(value)
          ? "Please enter a valid email"
          : "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name as keyof RegisterFormData, value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name as keyof RegisterFormData, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<RegisterFormData> = {};
    let hasErrors = false;
    (Object.keys(formData) as Array<keyof RegisterFormData>).forEach((key) => {
      const error = validateField(key, formData[key] as string);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({ username: true, email: true, password: true });

    if (hasErrors) return;

    try {
      console.log(formData)
      await register(formData).unwrap();
      // On success:
      setRegistrationSuccess(true);
      setFormData({ username: "", email: "", password: "" }); // Reset form
      setErrors({});
      setTouched({});
    } catch (err: any) {
      console.log(err)
      const fieldErrors = err?.data?.fields;
      if(fieldErrors) {
        setErrors(fieldErrors)
      } 
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);

  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-[350px] bg-white border border-gray-200 rounded p-8 space-y-6 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">Registration Successful!</h2>
          <p className="text-gray-600">
            We've sent a verification email to your address. Please check your inbox
            and verify your email to complete registration.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-[350px] bg-white border border-gray-200 rounded p-8 space-y-6">
        <div className="text-center">
          <img src="/logo/hive-logo.png" alt="Hive Logo" className="mx-auto w-24" />
          <p className="mt-3 font-bold text-gray-600">
            Connect with friends and discover moments you love.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <InputField
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Username"
            icon={<User size={18} className="text-gray-400" />}
            error={touched.username ? errors.username : undefined}
          />

          {/* Email */}
          <InputField
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Email address"
            icon={<Mail size={18} className="text-gray-400" />}
            error={touched.email ? errors.email : undefined}
          />

          {/* Password */}
          <div className="space-y-2">
            <InputField
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
              icon={<Lock size={18} className="text-gray-400" />}
              error={touched.password ? errors.password : undefined}
              suffix={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      <div className="w-[350px] bg-white border border-gray-200 rounded p-4 mt-4 text-center">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};