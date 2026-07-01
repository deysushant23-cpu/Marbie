"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function CustomerAuthModal() {
  const { showAuthModal, setShowAuthModal } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [inputValue, setInputValue] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setTimeout(() => {
      setStep(1);
      setInputValue("");
      setOtp(["", "", "", "", "", ""]);
      setIsLoading(false);
    }, 300);
  };

  // Google OAuth
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: window.location.href });
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) return;
    
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      // Dummy success
      const successOverlay = document.createElement("div");
      successOverlay.innerHTML = `
        <div style="position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);color:white;font-family:sans-serif;font-size:20px;flex-direction:column;gap:16px;">
          <span class="material-symbols-outlined" style="font-size:64px;color:#4ade80;">check_circle</span>
          <span>Successfully Verified (Simulated)</span>
        </div>
      `;
      document.body.appendChild(successOverlay);
      setTimeout(() => {
        document.body.removeChild(successOverlay);
        handleClose();
      }, 2000);
    }, 1500);
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Background Image & Blur Overlay */}
      <div style={{ position: "absolute", inset: 0, zIndex: -2 }}>
        <Image 
          src="/images/lookbook_hero.png"
          alt="Login Background"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div 
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Darken the image
          backdropFilter: "blur(8px)", // Soft background blur
          zIndex: -1,
        }}
        onClick={handleClose}
      />

      {/* Glassmorphism Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "rgba(255, 255, 255, 0.15)", // Glass background
          backdropFilter: "blur(24px)", // Intense glass blur
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.3)", // Glass border
          borderRadius: "24px",
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
          color: "#ffffff",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "48px 40px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right X Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Cancel login"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            zIndex: 10,
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
        </button>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "28px", fontWeight: 600, margin: "0 0 8px 0", letterSpacing: "-0.5px" }}>
            Login or Sign up
          </h3>
          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.7)", margin: "0" }}>
            Continue with your Google account
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Temporarily hidden OTP flow
              <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              ...
              </form>
              <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>...</div>
              */}

              <button
                onClick={handleGoogleSignIn}
                type="button"
                style={{
                  width: "100%",
                  padding: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle disclaimer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", marginTop: "32px", marginBottom: 0 }}>
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>

        {/* CSS for spinner */}
        <style>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
