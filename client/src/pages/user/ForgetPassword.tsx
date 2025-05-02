import React, { useState } from "react";
import { Mail } from "lucide-react";
import { InputField } from "@/components/InputField";
import { useForgetPasswordMutation } from "@/services/authApi";

export const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPassword, { isLoading }] = useForgetPasswordMutation();

  const validateEmail = (value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value)) return "Enter a valid email";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setTouched(true);
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setSuccessMessage("Reset link sent! Check your email.");
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to send reset link. Try again.");
    }
  };

  return (
    <div className="flex-col flex max-h-screen w-full items-center justify-center">
      <div className="w-[350px] bg-white rounded-[2px] border-gray-400 border space-y-8 mt-8 p-8">
        <div className="text-center flex items-center flex-col">
          <img className="w-30" src="/logo/hive-logo.png" alt="Hive Logo" />
          <p className="mt-3 font-bold text-gray-600">Forgot your password?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <InputField
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Enter your email"
            icon={<Mail size={18} className="text-gray-400" />}
            error={touched ? error || undefined : undefined}
          />

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-black py-3 px-4 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};
