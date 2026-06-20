import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [resendError, setResendError] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (!token) {
      setStatus("error");
      setMessage("This verification link is invalid or missing.");
      return;
    }

    api
      .get("/auth/verify-email", { params: { token } })
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          error.response?.data?.error || "This verification link has expired or is invalid. Please request a new one."
        );
      });
  }, [searchParams]);

  const onResend = async () => {
    if (!resendEmail) {
      setResendError("Enter your email to resend verification.");
      return;
    }

    setResendStatus("sending");
    setResendError("");

    try {
      await api.post("/auth/resend-verification", { email: resendEmail });
      setResendStatus("sent");
    } catch (error: any) {
      setResendError(
        error.response?.data?.error || "Unable to resend verification email. Please try again."
      );
      setResendStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-[#FCFCFC] border border-gray-200 shadow-sm rounded-3xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#111111] mb-3">Email verification</h1>
          <p className="text-sm text-[#666666]">We are confirming your Cloova account now.</p>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-[#111111]">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-green-100 border border-green-200 p-6 text-center">
              <p className="text-lg font-semibold text-[#111111]">{message}</p>
            </div>
            <button
              type="button"
              className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold"
              onClick={() => navigate("/login")}
            >
              Continue to Cloova
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#FFF1F0] border border-[#F0B5A3] p-6 text-center">
              <p className="text-lg font-semibold text-[#B62015]">{message}</p>
            </div>
            {resendStatus === "sent" ? (
              <div className="rounded-3xl bg-green-100 border border-green-200 p-6 text-center">
                <p className="text-sm text-[#111111]">A verification link has been sent if that email exists.</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold"
                  onClick={() => setShowResend(true)}
                >
                  Resend verification email
                </button>
                {showResend && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Your email</label>
                    <input
                      value={resendEmail}
                      onChange={(event) => setResendEmail(event.target.value)}
                      type="email"
                      placeholder="c.ejeh@alustudent.com"
                      className="w-full h-12 px-4 rounded-[8px] border border-gray-200 text-sm text-black bg-[#F8F9FA] focus:bg-white focus:border-[#111111] focus:outline-none"
                    />
                    {resendError && <p className="text-xs text-[#E74C3C]">{resendError}</p>}
                    <button
                      type="button"
                      disabled={resendStatus === "sending"}
                      onClick={onResend}
                      className="w-full h-11 bg-[#111111] text-white rounded-[8px] text-sm font-semibold"
                    >
                      {resendStatus === "sending" ? "Sending…" : "Send verification link"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
