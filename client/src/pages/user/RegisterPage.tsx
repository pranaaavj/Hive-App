import React, { useState } from "react";
import { RegisterFormData } from "@/types/auth";
import { InputField } from "@/components/InputField";
import { PasswordStrength } from "@/components/PasswordStrength";
import {User, Lock, EyeOff, Eye, Mail} from "lucide-react"

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (
    name: keyof RegisterFormData,
    value: string
  ): string => {
    switch (name) {
      case "username":
        return value.length < 3 ? "Username must be 3 characters" : "";
      case "email":
        return !/^\S+@\S+\.\S+$/.test(value)
          ? "Please enter a valid email"
          : "";
      case "password":
        return value.length < 8 ? "Password must be atleast 8 characters" : "";
      default:
        return "";
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (touched[name]) {
      const error = validateField(name as keyof RegisterFormData, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    const error = validateField(name as keyof RegisterFormData, value);
    setErrors({ ...errors, [name]: error });

  };

  const handleSubmit= (e: React.FormEvent) => {
    e.preventDefault()

      const newErrors: Partial<RegisterFormData> = {};
  let hasErrors = false;


    (Object.keys(formData) as Array<keyof RegisterFormData>).forEach((key) => {
      const error = validateField(key, formData[key] as string); // 👈 type assertion added
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
  

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      password: true
    });
    
    if (!hasErrors) {
      // Here you would typically send the data to your backend
      console.log('Form submitted successfully', formData);
      // You could redirect or show a success message here
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-[350px] space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-3 text-gray-600">Join us and start your journey today</p>
        </div>

        <div className="mt-8 bg-white p-8 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              
              {formData.password && (
                <PasswordStrength password={formData.password} />
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-black py-3 px-4 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
              >
                Register
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="#" className="font-medium text-black hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};