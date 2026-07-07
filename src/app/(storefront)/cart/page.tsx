"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart, CartItem } from "@/components/CartContext";
import { calculateEkartShippingRate, calculateCombinedWeight } from "@/lib/ekart";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Script from "next/script";

export default function CartPage() {
  const { items, total, count, clearCart, updateQuantity, removeFromCart, moveToWishlist, updateCustomerLocation, customerUser } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [addressInput, setAddressInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);

  // Voucher State
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const discountUsed = localStorage.getItem("marbie_first_order_discount_used");
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      if (!discountUsed && orderHistory.length === 0) {
        setIsFirstOrder(true);
      }
    }
  }, []);

  const isEligibleForDiscount = isFirstOrder && count >= 2;
  const discountAmount = isEligibleForDiscount ? Math.round(total * 0.10) : 0;
  const voucherDiscountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const totalWeightGrams = calculateCombinedWeight(items);
  const ekartShipping = calculateEkartShippingRate(totalWeightGrams, addressInput, paymentMethod, total);
  const shippingFee = items.length > 0 ? ekartShipping.fee : 0;
  const finalTotal = Math.max(0, total - discountAmount - voucherDiscountAmount) + shippingFee;

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    setIsValidatingVoucher(true);
    setVoucherError(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherInput, orderAmount: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid voucher code.");
      }
      setAppliedVoucher({
        code: data.code,
        discountAmount: data.discountAmount,
        message: data.message,
      });
      setVoucherInput("");
    } catch (err: any) {
      setVoucherError(err.message);
      setAppliedVoucher(null);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const hasGift = items.some(item => item.isGift);

  // Initialize address from saved location or gift location
  React.useEffect(() => {
    if (!addressInput) {
      if (hasGift) {
        const giftItem = items.find(item => item.isGift && item.giftLocation);
        if (giftItem && giftItem.giftLocation) {
          setAddressInput(giftItem.giftLocation);
          return;
        }
      }
      const saved = typeof window !== "undefined" ? localStorage.getItem("marbie_saved_location") : null;
      if (saved) {
        setAddressInput(saved);
      }
    }
  }, [items, hasGift, addressInput]);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            
            if (data && (data.address || data.display_name)) {
              let detectedAddress = data.display_name;
              if (data.address) {
                const road = data.address.road || data.address.suburb || data.address.neighbourhood || data.address.residential || "";
                const city = data.address.city || data.address.town || data.address.village || data.address.state_district || "";
                const state = data.address.state || "";
                const pin = data.address.postcode ? `- ${data.address.postcode}` : "";
                const parts = [road, city, state].filter(Boolean);
                if (parts.length >= 2) {
                  detectedAddress = `${parts.join(", ")} ${pin}`.trim();
                }
              }
              updateCustomerLocation(detectedAddress);
              setAddressInput(detectedAddress);
            } else {
              throw new Error("No address found for coordinates");
            }
          } catch (err) {
            console.error("Geocoding failed", err);
            const fallback = `GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)} (Please add Landmark/PIN)`;
            updateCustomerLocation(fallback);
            setAddressInput(fallback);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          alert("Could not access your location. Please check browser permissions or enter your complete address manually.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    if (item.quantity === 1) {
      setItemToRemove(item);
      setShowRemoveModal(true);
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncreaseQuantity = (item: CartItem) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!addressInput || !addressInput.trim() || addressInput.trim().length < 8) {
      alert("⚠️ Delivery location cannot be empty! Please enter a complete delivery address (including Street/Landmark, City, and PIN Code) or click 'Use Current Location'.");
      return;
    }
    
    setIsProcessing(true);

    const detailedPaymentMethod =
      paymentMethod === "cod" ? "Cash on Delivery (COD)" :
      paymentMethod === "upi" ? "UPI (GPay, PhonePe, Paytm)" :
      paymentMethod === "netbanking" ? "Net Banking" :
      paymentMethod === "card" ? "Credit / Debit Card" : "Online Payment";

    try {
      if (paymentMethod === "cod") {
        const finalOrderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            status: "PROCESSING",
            paymentMethod: detailedPaymentMethod,
            customerName: customerUser?.name || session?.user?.name || "Couture Client",
            initials: (customerUser?.name || session?.user?.name) ? (customerUser?.name || session?.user?.name)!.charAt(0).toUpperCase() : "C",
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            items: items,
            email: customerUser?.email || session?.user?.email || "",
            phone: customerUser?.phone || (session?.user as any)?.phone || "",
            userId: customerUser?.phone || customerUser?.email || (session?.user as any)?.id || session?.user?.email || "anonymous",
            shippingAddress: {
              address: addressInput,
              fullName: customerUser?.name || session?.user?.name || "Customer",
              email: customerUser?.email || session?.user?.email || "",
              phone: customerUser?.phone || (session?.user as any)?.phone || "",
              userId: customerUser?.phone || customerUser?.email || (session?.user as any)?.id || session?.user?.email || "anonymous",
              shippingFee: shippingFee,
              courier: ekartShipping.courier
            }
          }),
        });
        const newOrderResponse = await finalOrderRes.json();

        // Store locally for quick access
        const newOrder = {
          id: newOrderResponse.id || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          total: finalTotal,
          items: [...items],
          status: "PROCESSING",
          paymentMethod: detailedPaymentMethod
        };
        
        const existingHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
        localStorage.setItem("orderHistory", JSON.stringify([newOrder, ...existingHistory]));

        if (isEligibleForDiscount) {
          localStorage.setItem("marbie_first_order_discount_used", "true");
          setIsFirstOrder(false);
        }

        if (appliedVoucher) {
          fetch("/api/vouchers/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: appliedVoucher.code }),
          }).catch(err => console.error("Failed to claim voucher:", err));
        }

        clearCart();
        router.push("/history");
        return;
      }

      // 1. Create a Razorpay Order on our server
      const orderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Initialize Razorpay Checkout
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_T8aT6lPagbTyCA", // Live Key
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Marbie",
        description: "Couture Checkout",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) throw new Error(verifyData.error);

            // 4. Save Order to Database (Using existing /api/orders flow)
            const finalOrderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: finalTotal,
                status: "PROCESSING",
                paymentMethod: detailedPaymentMethod,
                customerName: customerUser?.name || session?.user?.name || "Couture Client",
                initials: (customerUser?.name || session?.user?.name) ? (customerUser?.name || session?.user?.name)!.charAt(0).toUpperCase() : "C",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                items: items,
                email: customerUser?.email || session?.user?.email || "",
                phone: customerUser?.phone || (session?.user as any)?.phone || "",
                userId: customerUser?.phone || customerUser?.email || (session?.user as any)?.id || session?.user?.email || "anonymous",
                shippingAddress: {
                  address: addressInput,
                  fullName: customerUser?.name || session?.user?.name || "Customer",
                  email: customerUser?.email || session?.user?.email || "",
                  phone: customerUser?.phone || (session?.user as any)?.phone || "",
                  userId: customerUser?.phone || customerUser?.email || (session?.user as any)?.id || session?.user?.email || "anonymous",
                  shippingFee: shippingFee,
                  courier: ekartShipping.courier
                }
              }),
            });
            const newOrderResponse = await finalOrderRes.json();

            // Store locally for quick access
            const newOrder = {
              id: newOrderResponse.id || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              total: finalTotal,
              items: [...items],
              status: "PROCESSING",
              paymentMethod: detailedPaymentMethod,
              paymentId: response.razorpay_payment_id
            };
            
            const existingHistory = JSON.parse(localStorage.getItem("orderHistory") || "[]");
            localStorage.setItem("orderHistory", JSON.stringify([newOrder, ...existingHistory]));

            if (isEligibleForDiscount) {
              localStorage.setItem("marbie_first_order_discount_used", "true");
              setIsFirstOrder(false);
            }

            if (appliedVoucher) {
              fetch("/api/vouchers/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: appliedVoucher.code }),
              }).catch(err => console.error("Failed to claim voucher:", err));
            }

            clearCart();
            router.push("/history");
          } catch (err) {
            console.error("Payment Verification Failed", err);
            alert("Payment verification failed. If money was deducted, it will be refunded.");
          }
        },
        prefill: {
          name: session?.user?.name || "Couture Client",
          email: session?.user?.email || "",
          contact: (session?.user as any)?.phone || "",
        },
        theme: {
          color: "#000000",
        },
      };

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please refresh the page and try again.");
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment failed: " + response.error.description);
      });
      rzp.open();
      
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert("Checkout Error: " + (error.message || error.toString()));
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <h1 className="section-title">Your Bag</h1>
      <div className="section-divider"></div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>Your bag is currently empty.</p>
          <Link href="/bracelets">
            <button className="btn-primary" style={{ width: "auto", padding: "16px 32px" }}>CONTINUE SHOPPING</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "48px", alignItems: "start" }}>
          {isFirstOrder && (
            <div style={{ gridColumn: "1 / -1", marginBottom: "-16px" }}>
              {count < 2 ? (
                <div style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)", padding: "16px 24px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid var(--color-secondary)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "var(--color-secondary)", flexShrink: 0 }}>card_giftcard</span>
                  <div>
                    <strong style={{ display: "block", fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-primary)", marginBottom: "4px" }}>🎁 Welcome Offer: Unlock 10% Off!</strong>
                    <span style={{ fontSize: "14px", color: "var(--color-on-surface-variant)" }}>You are shopping as a new customer! Add <strong>{2 - count} more item{2 - count > 1 ? "s" : ""}</strong> to your bag to instantly receive a <strong>10% First-Order Discount</strong> on your entire purchase!</span>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: "#063b2f", color: "#ffffff", padding: "16px 24px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "16px", border: "2px solid #d4af37", boxShadow: "0 6px 20px rgba(6,59,47,0.2)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#d4af37", flexShrink: 0 }}>verified</span>
                  <div>
                    <strong style={{ display: "block", fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#d4af37", marginBottom: "4px" }}>🎉 10% First-Order Discount Unlocked!</strong>
                    <span style={{ fontSize: "14px", color: "#ffffff", opacity: 0.95 }}>Congratulations! You have 2+ items in your bag as a new customer. You are saving <strong>₹{discountAmount.toLocaleString()} (10% OFF)</strong> on your first luxury purchase!</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="cart-items">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0, paddingBottom: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ display: "flex", gap: "24px", paddingBottom: "24px", marginBottom: "24px", borderBottom: "1px solid var(--color-outline-variant)", overflow: "hidden" }}
                >
                  <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0, backgroundColor: "var(--color-surface-variant)" }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} quality={90} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        {item.name}
                        {item.isGift && <span style={{ backgroundColor: "var(--color-secondary)", color: "white", padding: "2px 6px", fontSize: "10px", borderRadius: "4px" }}>🎁 GIFT</span>}
                      </h3>
                      {item.isGift && item.giftLocation && (
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", margin: "0 0 8px 0" }}>To: {item.giftLocation}</p>
                      )}
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-outline)", borderRadius: "4px" }}>
                          <button 
                            onClick={() => handleDecreaseQuantity(item)}
                            style={{ padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--color-on-surface)" }}
                          >
                            -
                          </button>
                          <span style={{ padding: "0 12px", minWidth: "32px", textAlign: "center", fontSize: "14px" }}>{item.quantity}</span>
                          <button 
                            onClick={() => handleIncreaseQuantity(item)}
                            style={{ padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", color: "var(--color-on-surface)" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <p style={{ fontWeight: 600, color: "var(--color-primary)" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                      {item.quantity > 1 && <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>(₹{item.price.toLocaleString()} each)</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* GPS Delivery Location Option */}
            <div style={{ backgroundColor: "var(--color-surface)", padding: "28px", border: "1px solid var(--color-secondary)", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "15px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--color-secondary)" }}>local_shipping</span>
                  Dispatch & Delivery Address
                </h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  style={{ padding: "8px 14px", borderRadius: "8px", backgroundColor: "var(--color-secondary)", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "12px", cursor: isLocating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "transform 0.2s" }}
                  onMouseOver={(e) => !isLocating && (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseOut={(e) => !isLocating && (e.currentTarget.style.transform = "scale(1)")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>my_location</span>
                  {isLocating ? "Locating..." : "Use Current Location"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter delivery address, Landmark, City, PIN Code"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    updateCustomerLocation(e.target.value);
                  }}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface)", fontSize: "14px", outline: "none" }}
                />
              </div>
              {addressInput && (
                <p style={{ fontSize: "12px", color: "green", marginTop: "8px", marginBottom: 0, fontWeight: 600 }}>
                  ✓ Dispatch point locked
                </p>
              )}
            </div>

            <div style={{ backgroundColor: "var(--color-surface)", padding: "32px", border: "1px solid var(--color-outline-variant)" }}>
              <h2 style={{ fontSize: "18px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>Order Summary</h2>

              {/* Voucher Code Input */}
              <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px dashed var(--color-outline-variant)" }}>
                <form onSubmit={handleApplyVoucher} style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Enter Voucher / Coupon Code"
                    value={voucherInput}
                    onChange={(e) => {
                      setVoucherInput(e.target.value.toUpperCase());
                      setVoucherError(null);
                    }}
                    disabled={!!appliedVoucher || isValidatingVoucher}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--color-outline-variant)", background: "var(--color-surface-container)", fontSize: "13px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", outline: "none" }}
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      style={{ padding: "10px 14px", background: "rgba(186, 26, 26, 0.1)", color: "#ba1a1a", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!voucherInput.trim() || isValidatingVoucher}
                      style={{ padding: "10px 16px", background: !voucherInput.trim() ? "#ccc" : "#063b2f", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: !voucherInput.trim() ? "not-allowed" : "pointer" }}
                    >
                      {isValidatingVoucher ? "..." : "Apply"}
                    </button>
                  )}
                </form>
                {voucherError && <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#ba1a1a", fontWeight: 600 }}>⚠️ {voucherError}</p>}
                {appliedVoucher && <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#063b2f", fontWeight: 700 }}>🎉 {appliedVoucher.message}</p>}
              </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--color-on-surface-variant)" }}>
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            {isEligibleForDiscount && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "#063b2f", fontWeight: 700, backgroundColor: "rgba(6,59,47,0.06)", padding: "10px 12px", borderRadius: "6px", border: "1px dashed #063b2f" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#d4af37" }}>local_offer</span>
                  First-Order Discount (10%)
                </span>
                <span>- ₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            {appliedVoucher && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "#1a56db", fontWeight: 700, backgroundColor: "rgba(26,86,219,0.06)", padding: "10px 12px", borderRadius: "6px", border: "1px dashed #1a56db" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#1a56db" }}>confirmation_number</span>
                  Voucher ({appliedVoucher.code})
                </span>
                <span>- ₹{voucherDiscountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", color: "var(--color-on-surface-variant)" }}>
              <div>
                <span style={{ display: "block", color: "var(--color-on-surface)" }}>Shipping ({ekartShipping.courier})</span>
                <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant)" }}>
                  Package Weight: ~{totalWeightGrams}g ({totalWeightGrams <= 500 ? "0–500g Slab" : totalWeightGrams <= 1000 ? "500g–1kg Slab" : "1kg–2kg Slab"} • Flat Rate)
                </span>
              </div>
              <span style={{ fontWeight: 600, color: "var(--color-primary)", fontSize: "15px" }}>₹{shippingFee.toLocaleString()}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", paddingTop: "24px", borderTop: "1px solid var(--color-outline-variant)", fontWeight: 700, fontSize: "18px", color: "var(--color-primary)" }}>
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "14px", color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Payment Method</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: paymentMethod === "card" ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)", borderRadius: "4px", cursor: "pointer", transition: "all 0.2s" }}>
                  <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} style={{ accentColor: "var(--color-primary)" }} />
                  <span className="material-symbols-outlined" style={{ color: paymentMethod === "card" ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>credit_card</span>
                  <span style={{ fontSize: "14px", fontWeight: paymentMethod === "card" ? 600 : 400 }}>Credit/Debit Card</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: paymentMethod === "upi" ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)", borderRadius: "4px", cursor: "pointer", transition: "all 0.2s" }}>
                  <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} style={{ accentColor: "var(--color-primary)" }} />
                  <span className="material-symbols-outlined" style={{ color: paymentMethod === "upi" ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>qr_code_scanner</span>
                  <span style={{ fontSize: "14px", fontWeight: paymentMethod === "upi" ? 600 : 400 }}>UPI (GPay, PhonePe, Paytm)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: paymentMethod === "netbanking" ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)", borderRadius: "4px", cursor: "pointer", transition: "all 0.2s" }}>
                  <input type="radio" name="paymentMethod" value="netbanking" checked={paymentMethod === "netbanking"} onChange={() => setPaymentMethod("netbanking")} style={{ accentColor: "var(--color-primary)" }} />
                  <span className="material-symbols-outlined" style={{ color: paymentMethod === "netbanking" ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>account_balance</span>
                  <span style={{ fontSize: "14px", fontWeight: paymentMethod === "netbanking" ? 600 : 400 }}>Net Banking</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", border: paymentMethod === "cod" ? "1px solid var(--color-primary)" : "1px solid var(--color-outline-variant)", borderRadius: "4px", cursor: hasGift ? "not-allowed" : "pointer", opacity: hasGift ? 0.6 : 1, transition: "all 0.2s", backgroundColor: hasGift ? "var(--color-surface-container)" : "transparent" }}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => !hasGift && setPaymentMethod("cod")} disabled={hasGift} style={{ accentColor: "var(--color-primary)" }} />
                  <span className="material-symbols-outlined" style={{ color: paymentMethod === "cod" ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>payments</span>
                  <span style={{ fontSize: "14px", fontWeight: paymentMethod === "cod" ? 600 : 400, color: hasGift ? "var(--color-on-surface-variant)" : "inherit" }}>Cash on Delivery (COD)</span>
                  {hasGift && <span style={{ fontSize: "12px", color: "var(--color-error)", marginLeft: "auto", fontStyle: "italic" }}>Not available for gifts</span>}
                </label>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleCheckout} 
              disabled={isProcessing}
              style={{ 
                width: "100%", 
                opacity: isProcessing ? 0.7 : 1, 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "8px",
                padding: "16px",
                cursor: isProcessing ? "not-allowed" : "pointer"
              }}
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined">hourglass_empty</span>
                  PROCESSING PAYMENT...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">lock</span>
                  PAY ₹{finalTotal.toLocaleString()} SECURELY
                </>
              )}
            </button>
            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant)", textAlign: "center", marginTop: "16px", fontStyle: "italic" }}>
              Secure, encrypted checkout. Taxes included.
            </p>
          </div>
          </div>
        </div>
      )}

      {/* Remove Item Modal */}
      {showRemoveModal && itemToRemove && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", animation: "modalIn 0.3s ease-out" }}>
          <div style={{ backgroundColor: "var(--color-surface)", padding: "32px", width: "400px", maxWidth: "90vw", borderRadius: "8px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "20px", color: "var(--color-primary)", marginBottom: "16px" }}>Remove Item?</h2>
            <p style={{ color: "var(--color-on-surface)", marginBottom: "24px", lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>{itemToRemove.name}</strong> from your bag?
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button 
                onClick={() => {
                  moveToWishlist(itemToRemove.id);
                  setShowRemoveModal(false);
                  setItemToRemove(null);
                }}
                style={{ padding: "12px", backgroundColor: "var(--color-secondary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Move to Wishlist
              </button>
              
              <button 
                onClick={() => {
                  removeFromCart(itemToRemove.id);
                  setShowRemoveModal(false);
                  setItemToRemove(null);
                }}
                style={{ padding: "12px", backgroundColor: "transparent", color: "var(--color-error)", border: "1px solid var(--color-error)", borderRadius: "4px", cursor: "pointer", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Remove from Bag
              </button>
              
              <button 
                onClick={() => {
                  setShowRemoveModal(false);
                  setItemToRemove(null);
                  router.push("/");
                }}
                style={{ padding: "12px", backgroundColor: "transparent", color: "var(--color-on-surface-variant)", border: "none", cursor: "pointer", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Cancel & Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
