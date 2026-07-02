"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import Image from "next/image";

type Step = "phone" | "register" | "pin" | "otp";

interface UserMeta {
  phone: string;
  cleanPhone: string;
  name?: string;
  isNewUser: boolean;
  maskedEmail?: string;
}

export default function CustomerAuthModal() {
  const { showAuthModal, setShowAuthModal } = useCart();

  // Form state
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [userMeta, setUserMeta] = useState<UserMeta | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = showAuthModal ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showAuthModal]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!showAuthModal) return null;

  const resetAll = () => {
    setStep("phone");
    setPhone("");
    setEmail("");
    setPin(["", "", "", "", "", ""]);
    setOtp(["", "", "", "", "", ""]);
    setUserMeta(null);
    setError("");
    setIsLoading(false);
    setResendCooldown(0);
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setTimeout(resetAll, 300);
  };

  const cleanPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    return digits.length === 10 ? "91" + digits : digits;
  };

  // ── STEP 1: Check if phone is registered ─────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();

      if (data.needsRegistration) {
        // New user — show registration form
        setUserMeta({ phone: digits, cleanPhone: cleanPhone(digits), isNewUser: true });
        setStep("register");
      } else if (data.needsPin) {
        // Existing user — ask for PIN
        setUserMeta({ phone: digits, cleanPhone: cleanPhone(digits), name: data.name, isNewUser: false });
        setStep("pin");
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 2a: New user submits email + PIN → send OTP ─────────────────────
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pinStr = pin.join("");
    if (!/^\d{6}$/.test(pinStr)) {
      setError("Please enter all 6 digits of your PIN.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userMeta!.phone, email, pin: pinStr, isNewUser: true }),
      });
      const data = await res.json();

      if (data.success) {
        setUserMeta(prev => prev ? { ...prev, maskedEmail: data.maskedEmail } : prev);
        setStep("otp");
        setResendCooldown(30);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 2b: Returning user submits PIN → send OTP ────────────────────────
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pinStr = pin.join("");
    if (!/^\d{6}$/.test(pinStr)) {
      setError("Please enter all 6 digits of your PIN.");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userMeta!.phone, pin: pinStr, isNewUser: false }),
      });
      const data = await res.json();

      if (data.success) {
        setUserMeta(prev => prev ? { ...prev, maskedEmail: data.maskedEmail } : prev);
        setStep("otp");
        setResendCooldown(30);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── STEP 3: Verify OTP → sign in ─────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length !== 6) return;
    setIsLoading(true);

    try {
      // First verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: userMeta!.phone, otp: otpStr }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setError(verifyData.error || "Invalid OTP. Please try again.");
        setIsLoading(false);
        return;
      }

      // Now sign in via NextAuth
      const result = await signIn("phone-pin-otp", {
        phone: verifyData.phone,
        verifiedToken: verifyData.verifiedToken,
        redirect: false,
      });

      if (result?.ok) {
        handleClose();
        window.location.reload();
      } else {
        setError("Sign in failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setResendCooldown(30);

    const pinStr = pin.join("");
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: userMeta!.phone,
        email: userMeta!.isNewUser ? email : undefined,
        pin: pinStr,
        isNewUser: userMeta!.isNewUser,
      }),
    });
    otpRefs.current[0]?.focus();
  };

  // Generic 6-box input handler (shared for PIN and OTP)
  const handleBoxInput = (
    index: number,
    value: string,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const v = value.slice(-1);
    const next = [...arr];
    next[index] = v;
    setArr(next);
    if (v && index < 5) refs.current[index + 1]?.focus();
  };

  const handleBoxKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    arr: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && arr[index] === "" && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const stepTitles: Record<Step, string> = {
    phone: "Welcome to Marbie",
    register: "Create your account",
    pin: `Welcome back${userMeta?.name ? `, ${userMeta.name.split(" ")[0]}` : ""}`,
    otp: "Verify your email",
  };
  const stepSubtitles: Record<Step, string> = {
    phone: "Enter your phone number to continue",
    register: "Set up your email and a 6-digit PIN",
    pin: "Enter your 6-digit PIN to continue",
    otp: `OTP sent to ${userMeta?.maskedEmail || "your email"}`,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
    border: "1px solid rgba(255,255,255,0.4)",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: isLoading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
  };

  const digitBoxStyle: React.CSSProperties = {
    width: "44px",
    height: "52px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px",
    color: "#fff",
    outline: "none",
    caretColor: "transparent",
    transition: "border-color 0.2s, background 0.2s",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
    >
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, zIndex: -2 }}>
        <Image src="/images/lookbook_hero.png" alt="Login Background" fill style={{ objectFit: "cover" }} priority />
      </div>
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)", zIndex: -1,
        }}
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "440px",
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.28)",
          borderRadius: "24px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.35)",
          color: "#ffffff",
          position: "relative",
          padding: "44px 36px 36px",
          overflow: "hidden",
        }}
      >
        {/* Decorative shimmer */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            width: "34px", height: "34px", borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
        </button>

        {/* Back button (for register/pin/otp steps) */}
        {step !== "phone" && (
          <button
            onClick={() => {
              setError("");
              setOtp(["", "", "", "", "", ""]);
              if (step === "otp") {
                setStep(userMeta?.isNewUser ? "register" : "pin");
              } else {
                setStep("phone");
              }
            }}
            style={{
              position: "absolute", top: "16px", left: "16px",
              width: "34px", height: "34px", borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
          </button>
        )}

        {/* Header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step + "-header"}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ textAlign: "center", marginBottom: "28px" }}
          >
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%", margin: "0 auto 16px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "26px" }}>
                {step === "phone" ? "person" : step === "otp" ? "mail" : step === "register" ? "edit_note" : "lock"}
              </span>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
              {stepTitles[step]}
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", margin: 0 }}>
              {stepSubtitles[step]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                backgroundColor: "rgba(220,50,50,0.2)", border: "1px solid rgba(220,50,50,0.4)",
                borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
                fontSize: "13px", color: "#ffaaaa", display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>error</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP: Phone ── */}
        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.form
              key="step-phone"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handlePhoneSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                  fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.7)", pointerEvents: "none",
                }}>+91</div>
                <input
                  type="tel"
                  placeholder="Mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  required
                  autoFocus
                  style={{ ...inputStyle, paddingLeft: "48px" }}
                />
              </div>
              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <Spinner /> : <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span> Continue</>}
              </button>
            </motion.form>
          )}

          {/* ── STEP: Register ── */}
          {step === "register" && (
            <motion.form
              key="step-register"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleRegisterSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                style={inputStyle}
              />
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "8px", letterSpacing: "0.05em" }}>
                  CREATE A 6-DIGIT PIN
                </label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                  {pin.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { pinRefs.current[i] = el; }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      autoFocus={i === 0}
                      onChange={(e) => handleBoxInput(i, e.target.value, pin, setPin, pinRefs)}
                      onKeyDown={(e) => handleBoxKeyDown(i, e, pin, pinRefs)}
                      style={digitBoxStyle}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "8px" }}>
                  Remember this PIN — you'll need it every time you sign in.
                </p>
              </div>
              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <Spinner /> : <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span> Send OTP to Email</>}
              </button>
            </motion.form>
          )}

          {/* ── STEP: PIN (returning user) ── */}
          {step === "pin" && (
            <motion.form
              key="step-pin"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handlePinSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "10px", letterSpacing: "0.05em", textAlign: "center" }}>
                  ENTER YOUR 6-DIGIT PIN
                </label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  {pin.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { pinRefs.current[i] = el; }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      autoFocus={i === 0}
                      onChange={(e) => handleBoxInput(i, e.target.value, pin, setPin, pinRefs)}
                      onKeyDown={(e) => handleBoxKeyDown(i, e, pin, pinRefs)}
                      style={digitBoxStyle}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isLoading} style={btnStyle}>
                {isLoading ? <Spinner /> : <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span> Send OTP to Email</>}
              </button>
            </motion.form>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <motion.form
              key="step-otp"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleOtpSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "10px", letterSpacing: "0.05em", textAlign: "center" }}>
                  ENTER 6-DIGIT OTP
                </label>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      autoFocus={i === 0}
                      onChange={(e) => handleBoxInput(i, e.target.value, otp, setOtp, otpRefs)}
                      onKeyDown={(e) => handleBoxKeyDown(i, e, otp, otpRefs)}
                      style={{
                        ...digitBoxStyle,
                        border: d ? "1px solid rgba(255,255,255,0.65)" : "1px solid rgba(255,255,255,0.25)",
                        backgroundColor: d ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.08)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={isLoading || otp.join("").length !== 6} style={btnStyle}>
                {isLoading ? <Spinner /> : <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span> Verify & Sign In</>}
              </button>

              <div style={{ textAlign: "center" }}>
                {resendCooldown > 0 ? (
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                    Resend OTP in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: "none", border: "none", color: "rgba(255,255,255,0.75)",
                      fontSize: "13px", cursor: "pointer", textDecoration: "underline",
                    }}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Step indicator dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "28px" }}>
          {(["phone", "register", "otp"] as Step[]).map((s, i) => {
            const stepOrder: Record<Step, number> = { phone: 0, register: 1, pin: 1, otp: 2 };
            const current = stepOrder[step];
            const isActive = i === current;
            const isPast = i < current;
            return (
              <div key={i} style={{
                width: isActive ? "20px" : "6px", height: "6px", borderRadius: "3px",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.9)"
                  : isPast ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s ease",
              }} />
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "16px", marginBottom: 0 }}>
          By continuing, you agree to our Terms of Service &amp; Privacy Policy.
        </p>

        <style>{`
          input::placeholder { color: rgba(255,255,255,0.35); }
          input:focus { border-color: rgba(255,255,255,0.55) !important; background-color: rgba(255,255,255,0.12) !important; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </motion.div>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
