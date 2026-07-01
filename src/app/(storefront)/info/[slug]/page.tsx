import React from "react";
import Link from "next/link";

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === "contact-us") {
    return (
      <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--color-on-surface-variant)", marginBottom: "48px" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
          Back to Home
        </Link>
        
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <h1 className="section-title" style={{ marginBottom: "16px" }}>Get In Touch</h1>
          <p style={{ color: "var(--color-on-surface-variant)", maxWidth: "600px", margin: "0 auto", fontSize: "16px", lineHeight: "1.8" }}>
            We're here to assist you. Whether you have a question about our collections, need help with an order, or want to discuss a bespoke creation, our concierge team is at your service.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", maxWidth: "1000px", margin: "0 auto" }}>
          {/* Email Card */}
          <a href="mailto:marbiejewels4@gmail.com" style={{ textDecoration: "none" }}>
            <div className="dashboard-card" style={{ padding: "40px 32px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(0, 36, 27, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>mail</span>
              </div>
              <h3 style={{ fontSize: "20px", color: "var(--color-on-surface)", margin: 0, fontFamily: "var(--font-display)" }}>Email Us</h3>
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "15px" }}>marbiejewels4@gmail.com</p>
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "13px", opacity: 0.7, marginTop: "8px" }}>We aim to reply within 24 hours.</p>
            </div>
          </a>

          {/* WhatsApp Card */}
          <a href="https://wa.me/918160143146" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div className="dashboard-card" style={{ padding: "40px 32px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(0, 36, 27, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>chat</span>
              </div>
              <h3 style={{ fontSize: "20px", color: "var(--color-on-surface)", margin: 0, fontFamily: "var(--font-display)" }}>WhatsApp</h3>
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "15px" }}>+91 81601 43146</p>
              <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "13px", opacity: 0.7, marginTop: "8px" }}>Instant messaging support.</p>
            </div>
          </a>

          {/* Business Hours Card */}
          <div className="dashboard-card" style={{ padding: "40px 32px", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(0, 36, 27, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>schedule</span>
            </div>
            <h3 style={{ fontSize: "20px", color: "var(--color-on-surface)", margin: 0, fontFamily: "var(--font-display)" }}>Operating Hours</h3>
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "15px" }}>Mon - Sat: 10:00 AM - 6:00 PM (IST)</p>
            <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "13px", opacity: 0.7, marginTop: "8px" }}>Closed on Sundays & Public Holidays.</p>
          </div>
        </div>
      </div>
    );
  }

  let title = "";
  let content = [];

  switch (slug) {
    case "shipping-and-returns":
    case "shipping-policy":
    case "shipping":
      title = "Shipping Policy";
      content = [
        "At Marbie Jewels, we strive to deliver your favourite jewellery safely and on time.",
        "Order Processing\n\n• Orders are processed within 1–3 business days after payment confirmation.\n• Orders placed on Sundays or public holidays will be processed on the next working day.",
        "Shipping Charges\n\n• ₹79 shipping charge is applicable on orders below ₹599.\n• FREE Shipping on all orders of ₹599 and above.",
        "Shipping Time\n\n• Standard delivery across India usually takes 3–7 business days, depending on your location.\n• Delivery timelines may vary due to festivals, public holidays, weather conditions, or courier delays.",
        "Order Tracking\n\n• Once your order is shipped, you will receive a tracking ID via WhatsApp, SMS, or Email.\n• You can track your order using the tracking details provided.",
        "Delivery\n\n• Please ensure your shipping address and contact details are accurate.\n• Marbie Jewels is not responsible for delays or failed deliveries caused by incorrect or incomplete address information.",
        "Damaged or Tampered Package\n\nIf your package arrives damaged or appears tampered with, please record a single continuous unboxing video starting from the sealed package and continuing until the product is completely unpacked. Contact us within 24 hours of delivery with the video and your order details.",
        "Need Help?\n\nFor any questions regarding your order or shipping, feel free to contact us.\n\n📧 Email: marbiejewels4@gmail.com\n📱 WhatsApp: +91 81601 43146",
        "Thank you for choosing Marbie Jewels. We are committed to delivering beautiful jewellery with a smooth and reliable shopping experience. ✨"
      ];
      break;
    case "refund-policy":
    case "return-policy":
    case "returns":
      title = "Return & Cancellation Policy";
      content = [
        "At Marbie Jewels, we take great care in inspecting and securely packing every order before dispatch to ensure it reaches you in perfect condition.",
        "Returns\n\nWe do not accept returns or exchanges for reasons such as:\n• Change of mind\n• Personal preference\n• Color or design expectations\n• Ordering the wrong product\n• Minor variations due to lighting or screen settings",
        "Please review all product details carefully before placing your order.",
        "Damaged or Wrong Product\n\nIf you receive a damaged, defective, or incorrect product, you must contact us within 24 hours of delivery.\n\nTo be eligible for a replacement, you must provide:\n• A single, continuous, unedited video starting before opening the sealed package.\n\nThe video must clearly show:\n• The sealed parcel with the shipping label visible.\n• The complete unboxing process without any cuts or pauses.\n• The product inside the package.\n• The damage or incorrect item clearly visible.",
        "Videos that start after the package has already been opened or videos with edits/cuts will not be accepted as proof.",
        "If the claim is verified, we will offer a replacement (subject to stock availability). If a replacement is unavailable, we may provide a refund or store credit at our discretion.",
        "Cancellation Policy\n\n• Orders can be cancelled only before they are shipped.\n• Once an order has been dispatched, it cannot be cancelled.",
        "Contact Us\n\nFor any concerns regarding your order, please contact us within 24 hours of delivery with your order number and the required unboxing video.",
        "Thank you for shopping with Marbie Jewels. We appreciate your trust and support."
      ];
      break;
    case "care-guide":
      title = "Care Guide";
      content = [
        "Your Marbie Jewels piece is crafted to last a lifetime. To maintain its brilliance, we recommend the following care:",
        "• Avoid exposing your jewelry to harsh chemicals, perfumes, or lotions. Apply cosmetics and perfumes before putting on your jewelry.",
        "• Store each piece separately in its original Marbie Jewels pouch to prevent scratching.",
        "• Clean your gold and diamond pieces gently with a soft, lint-free cloth or a mild soap solution and a very soft brush.",
        "For professional cleaning and prong inspection, please visit one of our boutiques annually."
      ];
      break;
    case "about-us":
      title = "About Marbie Jewels";
      content = [
        "Founded on the principle of timeless elegance, Marbie Jewels has been crafting stunning premium artificial jewelry since 2024. We believe that beautiful jewelry is more than an accessory—it's a wearable piece of art that tells your unique story.",
        "Our master craftsmen blend traditional techniques with modern design sensibilities to create collections that range from minimalist everyday luxury to breathtaking bridal masterpieces.",
        "We are committed to delivering exceptional quality, exclusively using high-grade materials and premium stones that capture the brilliance of fine jewelry without the exorbitant price tag."
      ];
      break;
    case "privacy-policy":
      title = "Privacy Policy";
      content = [
        "Your privacy is of the utmost importance to us. This policy outlines how Marbie Jewels collects, uses, and protects your personal information.",
        "We collect information that you provide when creating an account, placing an order, or subscribing to our newsletter. This includes your name, email address, shipping address, and payment details.",
        "We use this information strictly to process your orders, provide customer support, and comply with legal obligations. We use secure third-party payment gateways (like Razorpay) and do not store your credit card information on our servers.",
        "We do not sell, trade, or rent your personal identification information to others."
      ];
      break;
    case "terms-of-service":
    case "terms-and-conditions":
      title = "Terms & Conditions";
      content = [
        "By accessing and using the Marbie Jewels website, you agree to comply with our Terms of Service.",
        "All content on this site, including images, designs, and text, is the intellectual property of Marbie Jewels and may not be reproduced without permission.",
        "We reserve the right to modify prices and product availability without prior notice. In the event of a pricing error, we reserve the right to cancel any orders placed for the incorrectly priced item.",
        "These terms shall be governed by and construed in accordance with the laws of India."
      ];
      break;
    default:
      title = "Information";
      content = ["The information you requested could not be found."];
  }

  return (
    <div className="container" style={{ paddingTop: "120px", paddingBottom: "120px", minHeight: "80vh", maxWidth: "800px" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", color: "var(--color-on-surface-variant)", marginBottom: "48px" }}>
        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
        Back to Home
      </Link>
      
      <h1 className="section-title" style={{ textAlign: "left", marginBottom: "48px" }}>{title}</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "var(--color-on-surface)", lineHeight: 1.8 }}>
        {content.map((paragraph, index) => (
          <p key={index} style={{ whiteSpace: "pre-line" }}>{paragraph}</p>
        ))}
      </div>
      
      <div className="section-divider" style={{ marginTop: "64px", marginBottom: "64px" }}></div>
      
      <div style={{ textAlign: "center", padding: "48px", backgroundColor: "var(--color-surface-variant)", borderRadius: "8px" }}>
        <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Still have questions?</h3>
        <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "24px" }}>Our dedicated concierge team is here to assist you.</p>
        <Link href="/info/contact-us">
          <button className="btn-primary" style={{ width: "auto", padding: "12px 32px", backgroundColor: "transparent", border: "1px solid var(--color-primary)", color: "var(--color-primary)", cursor: "pointer" }}>
            CONTACT US
          </button>
        </Link>
      </div>
    </div>
  );
}
