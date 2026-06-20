import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../lib/api";
import { useToastStore } from "../../lib/store";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: data.email });
      setServerMessage(res.data?.message || "If an account exists with that email, a reset link has been sent.");
      setSubmitted(true);
    } catch (err: any) {
      setServerMessage("If an account exists with that email, a reset link has been sent.");
      addToast("If an account exists with that email, a reset link has been sent.", "info");
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-[#FCFCFC] border border-gray-200 shadow-sm rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#111111] mb-3">Forgot password</h1>
          <p className="text-sm text-[#666666]">Enter your email and we’ll send a password reset link if your account exists.</p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="rounded-3xl bg-green-100 border border-green-200 p-6 text-center">
              <p className="text-lg font-semibold text-[#111111]">If an account exists, a reset link has been sent.</p>
              <p className="mt-2 text-sm text-[#4B5563]">Check your inbox and follow the instructions to reset your password.</p>
            </div>
            <button
              type="button"
              className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold"
              onClick={() => navigate("/login")}
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="c.ejeh@alustudent.com"
                className={`w-full h-12 px-4 rounded-[8px] border text-sm text-black bg-[#F8F9FA] focus:bg-white focus:border-[#111111] focus:outline-none ${errors.email ? "border-[#E74C3C]" : "border-gray-200"}`}
              />
              {errors.email && <p className="text-xs text-[#E74C3C] mt-2">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold">
              {loading ? <LoadingSpinner size="sm" /> : "Send reset link"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full h-11 border border-gray-200 rounded-[8px] text-sm font-semibold text-[#111111]"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
