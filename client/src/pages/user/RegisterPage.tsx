import React, { useState } from "react";
import { RegisterFormData } from "@/types/auth";
import { InputField } from "@/components/InputField";
import { PasswordStrength } from "@/components/PasswordStrength";
import {User, Lock, EyeOff, Eye, Mail} from "lucide-react"
import {Link} from "react-router-dom"
import { useRegisterMutation } from "@/services/authApi";


export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [register,{isLoading}] = useRegisterMutation()

  const validateField = (
    name: keyof RegisterFormData,
    value: string
  ): string => {
    switch (name) {
      case "username":
        if (!value.trim()) {
          return "Email or username is required";
        }
        return value.length < 3 ? "Username must be 3 characters" : "";
      case "email":
        return !/^\S+@\S+\.\S+$/.test(value)
          ? "Please enter a valid email"
          : "";
      case "password":

      if (!value) {
        return "Password is required";
      }
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

  const handleSubmit= async(e: React.FormEvent) => {
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
      try {
        console.log(formData,'formdat from register')
        await register(formData).unwrap()
      } catch (error) {
        setErrors({ email: 'Registration failed. Try again.' });
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 
  return (
    <div className="flex-col flex max-h-screen w-full items-center justify-center">
      <div className="w-[350px] bg-white rounded-[2px] border-gray-400  border space-y-8 mt-8 p-8">
        <div className="text-center flex items-center flex-col">
        <img className="w-30" src="/logo/hive-logo.png" alt="Hive Logo" />
          <p className="mt-3 font-bold text-gray-600">Connect with friends and discover moments you love.</p>
        </div>

       
          <form onSubmit={handleSubmit} className="space-y-3">
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
                 {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>

          
        </div>
        <div className="w-[350px] bg-white rounded-[2px] border-gray-400 border space-y-8 mt-3 p-4">
          <div>
            <p>Already have an account ?</p>
            <Link className="text-blue-500 font-bold hover:underline" to="/login">Login</Link>
          </div>

        </div>
      </div>
    
  );
};