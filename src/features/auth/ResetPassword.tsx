import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../lib/api";
import { useToastStore } from "../../lib/store";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [status, setStatus] = useState<"loading" | "form" | "success" | "error">("loading");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const tokenValue = searchParams.get("token") || "";
    if (!tokenValue) {
      setStatus("error");
      setServerMessage("This reset link is invalid or missing.");
      return;
    }
    setToken(tokenValue);
    setStatus("form");
  }, [searchParams]);

  const onSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      setServerMessage("Passwords must match.");
      return;
    }

    setStatus("loading");
    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      setStatus("success");
      setServerMessage("Your password has been updated successfully.");
    } catch (err: any) {
      setStatus("error");
      const message = err.response?.data?.error || "Unable to reset password. Please try again.";
      setServerMessage(message);
      addToast(message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-[#FCFCFC] border border-gray-200 shadow-sm rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#111111] mb-3">Reset password</h1>
          <p className="text-sm text-[#666666]">Enter a new password for your Cloova account.</p>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-[#111111]">Verifying reset link...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-green-100 border border-green-200 p-6 text-center">
              <p className="text-lg font-semibold text-[#111111]">Password updated.</p>
              <p className="mt-2 text-sm text-[#4B5563]">You can now sign in with your new password.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold"
            >
              Log in
            </button>
          </div>
        )}

        {(status === "form" || status === "error") && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                {...register("newPassword")}
                placeholder="••••••••"
                className={`w-full h-12 px-4 rounded-[8px] border text-sm text-black bg-[#F8F9FA] focus:bg-white focus:border-[#111111] focus:outline-none ${errors.newPassword ? "border-[#E74C3C]" : "border-gray-200"}`}
              />
              {errors.newPassword && <p className="text-xs text-[#E74C3C] mt-2">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••"
                className={`w-full h-12 px-4 rounded-[8px] border text-sm text-black bg-[#F8F9FA] focus:bg-white focus:border-[#111111] focus:outline-none ${errors.confirmPassword ? "border-[#E74C3C]" : "border-gray-200"}`}
              />
              {errors.confirmPassword && <p className="text-xs text-[#E74C3C] mt-2">{errors.confirmPassword.message}</p>}
            </div>

            {status === "error" && serverMessage && (
              <p className="text-sm text-[#E74C3C]">{serverMessage}</p>
            )}

            <button type="submit" className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold">
              Set new password
            </button>

            <button
              type="button"
              className="w-full h-11 border border-gray-200 rounded-[8px] text-sm font-semibold text-[#111111]"
              onClick={() => navigate("/login")}
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
