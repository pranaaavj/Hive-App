import { InputField } from "@/components/InputField";
import { LoginFormData } from "@/types/auth";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useLoginMutation } from "@/services/authApi";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { ApiError } from "@/types/error";

export const LoginPage: React.FC = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [login, { isLoading }] = useLoginMutation();

  const validateField = (name: keyof LoginFormData, value: string): string => {
    switch (name) {
      case "identifier": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value.trim()) {
          return "Email or username is required";
        }

        if (emailRegex.test(value)) {
          if (value.length > 100) {
            return "Email is too long";
          }
          return "";
        } else {
          if (value.length < 3) {
            return "Username must be at least 3 characters";
          }
          if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
            return "Username can only contain letters, numbers, dots, underscores, and hyphens";
          }
          return "";
        }
      }

      case "password": {
        if (!value) {
          return "Password is required";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      const error = validateField(name as keyof LoginFormData, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });

    const error = validateField(name as keyof LoginFormData, value);
    setErrors({ ...errors, [name]: error });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<LoginFormData> = {};
    let hasErrors = false;

    (Object.keys(formData) as (keyof LoginFormData)[]).forEach((key) => {
      const value = formData[key];
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      identifier: true,
      password: true,
    });

    if (!hasErrors) {
      try {
        const res = await login(formData).unwrap();
        console.log(res?.data?.user)
        dispatch(setUser({user: res.user}))     
        localStorage.setItem('accessToken',res.accessToken)
        navigate("/home")
    
      } catch (err) {
  const apiErr = err as ApiError;
  const message = apiErr.data?.error || "Login failed. Please try again.";
  setErrors({ identifier: message });
}
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex-col flex max-h-screen w-full items-center justify-center">
      <div className="w-[350px] bg-white rounded-[2px] border-gray-400 border space-y-8 mt-8 p-8">
        <div className="text-center flex items-center flex-col">
          <img className="w-40" src="/logo/New-hive-logo.png" alt="Hive Logo" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Username or Email"
            icon={<User size={18} className="text-gray-400" />}
            error={touched.identifier ? errors.identifier : undefined}
          />

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
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {/* {formData.password && (
                <PasswordStrength password={formData.password} />
              )} */}
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-black py-3 px-4 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>

          <hr className="my-4 border-gray-300" />

          <Link className="text-gray-500" to="/forget-password">
            Forgot your password ?
          </Link>
        </form>
      </div>
      <div className="w-[350px] bg-white rounded-[2px] border-gray-400 border space-y-8 mt-3 p-4">
        <div>
          <p>Don' have an account ?</p>
          <Link
            className="text-blue-500 font-bold hover:underline"
            to="/register"
          >
            Sign up
          </Link>
        </div>
      </div>
      {/* {isError && (
        <p className="text-red-500 text-sm">
          {(error as any)?.data?.message ||
            "An error occurred. Please try again."}
        </p>
      )} */}
    </div>
  );
};
