"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductProps } from "./ProductCard";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  products?: ProductProps[];
};

export default function WingmanChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hello! ✧ I'm the Marbie Assistant. Whether you're looking for a bridal set or a gift, I'm here to help. What occasion are we shopping for today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 300);
    }
  }, [messages, isOpen]);

  const suggestedQueries = [
    "Bridal Sets 💍",
    "Gifts under 5000 🎁",
    "Gold Necklaces ✨"
  ];

  const handleSubmit = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const userText = textOverride || input.trim();
    if (!userText) return;

    if (!textOverride) setInput("");

    const newMessages = [...messages, { id: Date.now().toString(), role: "user" as const, content: userText }];
    setMessages(newMessages);
    setIsTyping(true);
    setTimeout(scrollToBottom, 100);

    try {
      const response = await fetch("/api/wingman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: newMessages }),
      });
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: data.reply || "I'm having trouble connecting right now, but I'd still love to help you browse our collections!",
          products: data.products || []
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "Oops! My connection was interrupted. Please try again or browse our collections via the menu."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (query: string) => {
    handleSubmit(undefined, query);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,36,27,0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>auto_awesome</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              width: "calc(100vw - 32px)",
              maxWidth: "400px",
              height: "600px",
              maxHeight: "calc(100vh - 64px)",
              backgroundColor: "rgba(252, 249, 248, 0.75)",
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              borderRadius: "24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2), 0 0 1px rgba(255,255,255,0.5) inset",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              zIndex: 9999,
              border: "1px solid rgba(255, 255, 255, 0.4)"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-on-primary)"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>auto_awesome</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-on-surface)" }}>Marbie Assistant</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--color-primary)", fontWeight: 600 }}>Active & Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-on-surface-variant)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                  borderRadius: "50%"
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Chat Area */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              backgroundColor: "transparent"
            }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px"
                }}>
                  <div style={{
                    maxWidth: "85%",
                    padding: "14px 18px",
                    borderRadius: "20px",
                    borderBottomRightRadius: msg.role === "user" ? "4px" : "20px",
                    borderTopLeftRadius: msg.role === "bot" ? "4px" : "20px",
                    backgroundColor: msg.role === "user" ? "var(--color-primary)" : "rgba(255, 255, 255, 0.6)",
                    boxShadow: msg.role === "bot" ? "0 4px 12px rgba(0,0,0,0.03), 0 0 1px rgba(255,255,255,0.8) inset" : "none",
                    color: msg.role === "user" ? "var(--color-on-primary)" : "var(--color-on-surface)",
                    fontSize: "14px",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-body)"
                  }}>
                    {msg.content}
                  </div>
                  
                  {/* Recommended Products */}
                  {msg.products && msg.products.length > 0 && (
                    <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "8px", maxWidth: "100%", scrollbarWidth: "none" }}>
                      {msg.products.map(product => (
                        <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: "none", display: "block" }}>
                          <div style={{
                            width: "160px",
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            border: "1px solid rgba(255, 255, 255, 0.8)",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                          }}>
                            <div style={{ width: "100%", height: "120px", position: "relative" }}>
                              <Image src={product.image || ""} alt={product.name} fill style={{ objectFit: "cover" }} />
                            </div>
                            <div style={{ padding: "12px" }}>
                              <h4 style={{ margin: "0 0 4px 0", fontSize: "12px", color: "var(--color-on-surface)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</h4>
                              <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "var(--color-primary)" }}>₹{product.price}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div style={{ alignSelf: "flex-start", backgroundColor: "rgba(255, 255, 255, 0.6)", boxShadow: "0 4px 12px rgba(0,0,0,0.03), 0 0 1px rgba(255,255,255,0.8) inset", padding: "14px 18px", borderRadius: "20px", borderTopLeftRadius: "4px" }}>
                  <motion.div style={{ display: "flex", gap: "4px" }}>
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} style={{ width: "6px", height: "6px", backgroundColor: "var(--color-on-surface-variant)", borderRadius: "50%" }} />
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: "6px", height: "6px", backgroundColor: "var(--color-on-surface-variant)", borderRadius: "50%" }} />
                    <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: "6px", height: "6px", backgroundColor: "var(--color-on-surface-variant)", borderRadius: "50%" }} />
                  </motion.div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: "16px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.4)",
              borderTop: "1px solid rgba(255, 255, 255, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {/* Suggestions */}
              {messages.length < 3 && !isTyping && (
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", scrollbarWidth: "none" }}>
                  {suggestedQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(query.replace(/[^\w\s]/g, "").trim())}
                      style={{
                        whiteSpace: "nowrap",
                        padding: "8px 12px",
                        borderRadius: "16px",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        color: "var(--color-primary)",
                        fontSize: "12px",
                        fontWeight: 500,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--color-primary)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.7)"}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: "40px",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02) inset",
                    color: "var(--color-on-surface)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit"
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    backgroundColor: input.trim() ? "var(--color-primary)" : "var(--color-outline-variant)",
                    color: input.trim() ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: input.trim() ? "pointer" : "default",
                    transition: "all 0.2s"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
                </button>
              </form>
              <div style={{ textAlign: "center", marginTop: "12px", fontSize: "10px", color: "var(--color-on-surface-variant)", letterSpacing: "0.05em" }}>
                YOUR PERSONAL JEWELRY STYLIST.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
