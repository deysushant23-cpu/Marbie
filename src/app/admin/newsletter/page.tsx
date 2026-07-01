"use client";

import React, { useState, useEffect } from "react";

interface Subscriber {
  id: string;
  email: string;
  date: string;
  status?: string;
}

interface Campaign {
  id: string;
  subject: string;
  banner: string;
  title: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  date: string;
  recipients: number;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "history">("compose");

  // Subscriber entry state
  const [newEmail, setNewEmail] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // Letter broadcast state
  const [subject, setSubject] = useState("👑 Royal Summer Bridal Drop - Gilded Steals");
  const [banner, setBanner] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuBCiszRq5LNv5_06qoHu5y0glWLWVdZFWWnWug4_HzcsHjoNfQiGjnoIRv2HQRRXCRJxfJobyX7XVZ6u__BigftYGOz27MY2TV6pOX3hlObr4wgmqEQoC7ornVSjWZUqsI22odDzbZ6dtUW3q490DzPW9J17JV7Imao5L1RYU9y95U0JhVZCc9IEE3Z269ViUUNDWxJXSG_s-4BkljJQZjgma1iziyNTp83HvT6naXjn5oFPxTbVmmjnCNXLdTJn6_8sM25V_sV661g");
  const [title, setTitle] = useState("The Gilded Royal Summer Collection");
  const [letterBody, setLetterBody] = useState("Dearest Royal Bride,\n\nWe are thrilled to unveil our exclusive summer curation of handcrafted Kundan and Polki masterpieces. Designed for Haldi soirées and grand wedding galas, each piece is gilded in 18K gold and hallmarked for purity.\n\nEnjoy complimentary VIP concierge express shipping on all orders this week.");
  const [ctaText, setCtaText] = useState("EXPLORE THE ROYAL DROP");
  const [ctaLink, setCtaLink] = useState("http://localhost:3000/necklaces");
  const [isSending, setIsSending] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const loadData = () => {
    Promise.all([
      fetch("/api/newsletter").then(res => res.json()),
      fetch("/api/newsletter/broadcast").then(res => res.json())
    ])
    .then(([subsData, campsData]) => {
      setSubscribers(Array.isArray(subsData) ? subsData : []);
      setCampaigns(Array.isArray(campsData) ? campsData : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("Error loading newsletter data", err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail })
      });
      if (res.ok) {
        setMessage(`✅ ${newEmail} added to subscribers.`);
        setNewEmail("");
        loadData();
        setTimeout(() => setMessage(""), 4000);
      }
    } catch {}
  };

  const handleDeleteSub = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the list?`)) return;
    await fetch(`/api/newsletter?id=${id}`, { method: "DELETE" });
    setSubscribers(subscribers.filter(s => s.id !== id));
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !title || !letterBody) {
      alert("Please fill in subject, title, and letter content.");
      return;
    }
    setIsSending(true);
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, banner, title, body: letterBody, ctaText, ctaLink })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`🚀 Letter broadcast sent successfully to ${data.deliveredCount || subscribers.length} subscriber mailboxes!`);
        loadData();
        setPreviewModalOpen(true);
        setTimeout(() => setMessage(""), 6000);
      }
    } catch {
      setMessage("❌ Error sending broadcast.");
    } finally {
      setIsSending(false);
    }
  };

  const exportCSV = () => {
    const headers = "ID,Email,Date Subscribed,Status\n";
    const rows = subscribers.map(s => `"${s.id}","${s.email}","${s.date}","${s.status || "active"}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `marbie_newsletter_subscribers.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const copyHTMLCode = () => {
    const html = `<div style="max-width:600px;margin:0 auto;font-family:serif;background:#fcf9f8;color:#222;border:1px solid #dcd9d9;border-radius:12px;overflow:hidden;"><img src="${banner}" style="width:100%;display:block;" /><div style="padding:32px 28px;text-align:center;"><h1 style="font-size:26px;color:#00241b;margin-bottom:16px;">${title}</h1><p style="font-family:sans-serif;font-size:15px;line-height:1.7;color:#404945;white-space:pre-line;">${letterBody}</p><div style="margin:32px 0;"><a href="${ctaLink}" style="background:#00241b;color:#fed65b;padding:16px 32px;text-decoration:none;font-family:sans-serif;font-size:13px;font-weight:bold;letter-spacing:2px;border-radius:4px;display:inline-block;">${ctaText}</a></div></div></div>`;
    navigator.clipboard.writeText(html);
    alert("✅ Royal HTML Email code copied to clipboard!");
  };

  const filteredSubs = subscribers.filter(s => s.email.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return <div style={{ padding: "48px", textAlign: "center" }}>Loading Campaign Manager...</div>;
  }

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", paddingBottom: "90px" }}>
      <header className="page-header" style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--color-on-surface)" }}>
            Newsletter & Campaign Broadcast
          </h1>
          <p style={{ color: "var(--color-on-surface-variant)", margin: 0, fontSize: "14px" }}>
            Post promotional banners and write royal letters to broadcast directly into your subscribed users' Gmail mailboxes.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setPreviewModalOpen(true)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface)", color: "var(--color-primary)", fontWeight: 700, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined">mark_email_read</span>
            Gmail Mailbox Preview
          </button>
          <button onClick={exportCSV} className="btn-primary" style={{ padding: "12px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="material-symbols-outlined">download</span>
            Export CSV ({subscribers.length})
          </button>
        </div>
      </header>

      {message && (
        <div style={{ padding: "14px 20px", borderRadius: "8px", marginBottom: "24px", backgroundColor: message.includes("🚀") || message.includes("✅") ? "rgba(10,77,60,0.12)" : "rgba(180,30,30,0.1)", border: message.includes("🚀") || message.includes("✅") ? "1px solid #0a4d3c" : "1px solid #b41e1e", color: message.includes("🚀") || message.includes("✅") ? "#0a4d3c" : "#b41e1e", fontWeight: 700, fontSize: "15px" }}>
          {message}
        </div>
      )}

      {/* Tabs Bar */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid var(--color-outline-variant)", marginBottom: "32px" }}>
        <button
          onClick={() => setActiveTab("compose")}
          style={{ padding: "14px 24px", fontWeight: 700, fontSize: "14px", borderBottom: activeTab === "compose" ? "3px solid var(--color-primary)" : "none", color: activeTab === "compose" ? "var(--color-primary)" : "var(--color-on-surface-variant)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span className="material-symbols-outlined">campaign</span>
          1. Compose & Post Banner Letter
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          style={{ padding: "14px 24px", fontWeight: 700, fontSize: "14px", borderBottom: activeTab === "subscribers" ? "3px solid var(--color-primary)" : "none", color: activeTab === "subscribers" ? "var(--color-primary)" : "var(--color-on-surface-variant)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span className="material-symbols-outlined">group</span>
          2. Subscriber Database ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          style={{ padding: "14px 24px", fontWeight: 700, fontSize: "14px", borderBottom: activeTab === "history" ? "3px solid var(--color-primary)" : "none", color: activeTab === "history" ? "var(--color-primary)" : "var(--color-on-surface-variant)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span className="material-symbols-outlined">history</span>
          3. Sent Broadcast Log ({campaigns.length})
        </button>
      </div>

      {/* TAB 1: COMPOSE & BROADCAST */}
      {activeTab === "compose" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "32px" }}>
          {/* Left Compose Editor */}
          <form onSubmit={handleBroadcast} style={{ backgroundColor: "var(--color-surface)", padding: "32px", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
              <span className="material-symbols-outlined">edit_square</span>
              Letter & Banner Studio
            </h2>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>
                Campaign Subject Line (Shown in Gmail Inbox)
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px", fontWeight: 600 }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>
                Promotional Banner Image URL
              </label>
              <input
                type="text"
                value={banner}
                onChange={e => setBanner(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "13px" }}
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>
                Offer Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "15px", fontFamily: "var(--font-serif)" }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>
                Royal Letter Commentary (Sent to Subscribers)
              </label>
              <textarea
                rows={7}
                value={letterBody}
                onChange={e => setLetterBody(e.target.value)}
                style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>CTA Button Text</label>
                <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "13px" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-on-surface-variant)", marginBottom: "8px" }}>Button Link URL</label>
                <input type="text" value={ctaLink} onChange={e => setCtaLink(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)", fontSize: "13px" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button type="button" onClick={() => setPreviewModalOpen(true)} style={{ flex: 1, padding: "16px", borderRadius: "8px", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface-container)", color: "var(--color-primary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="material-symbols-outlined">visibility</span>
                Preview Mailbox UI
              </button>
              <button type="submit" disabled={isSending} className="btn-primary" style={{ flex: 2, padding: "16px", fontSize: "14px", fontWeight: 700, cursor: isSending ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="material-symbols-outlined">send</span>
                {isSending ? "Broadcasting..." : `Post & Send to All (${subscribers.length})`}
              </button>
            </div>
          </form>

          {/* Right Instant Live MailCard Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              💡 Live Gmail Card Preview
            </div>

            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0e0e0", boxShadow: "0 12px 40px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {/* Gmail Header Mock */}
              <div style={{ backgroundColor: "#f2f6fc", padding: "12px 20px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ea4335", fontWeight: 800, fontSize: "18px" }}>M</span>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "#444" }}>Gmail Inbox • Subscribed Message</span>
                </div>
                <span style={{ fontSize: "11px", color: "#777", backgroundColor: "#fff", padding: "3px 8px", borderRadius: "12px", border: "1px solid #ccc" }}>Primary</span>
              </div>

              {/* Email Meta */}
              <div style={{ padding: "20px 24px 12px", borderBottom: "1px solid #f0f0f0" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px 0", color: "#222" }}>{subject || "Subject line..."}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#00241b", color: "#fed65b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px" }}>MJ</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "#222" }}>Marbie Jewels Concierge <span style={{ fontWeight: 400, color: "#666" }}>&lt;concierge@marbiejewels.com&gt;</span></div>
                    <div style={{ fontSize: "12px", color: "#888" }}>to subscribed.shopper@gmail.com</div>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div style={{ backgroundColor: "#fcf9f8", padding: "24px" }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #eaeaea", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                  {banner && <img src={banner} alt="Royal Banner" style={{ width: "100%", maxHeight: "240px", objectFit: "cover", display: "block" }} />}
                  <div style={{ padding: "32px 28px", textAlign: "center" }}>
                    <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "#00241b", margin: "0 0 16px 0" }}>{title}</h4>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#735c00", marginBottom: "20px" }}>
                      <span style={{ height: "1px", width: "40px", backgroundColor: "#ccc" }}></span>
                      <span>❧ ✿ ❧</span>
                      <span style={{ height: "1px", width: "40px", backgroundColor: "#ccc" }}></span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#444", lineHeight: 1.8, whiteSpace: "pre-line", textAlign: "left", margin: "0 0 28px 0" }}>{letterBody}</p>
                    <a href={ctaLink} style={{ backgroundColor: "#00241b", color: "#fed65b", padding: "14px 28px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "12px", letterSpacing: "2px", display: "inline-block" }}>
                      {ctaText}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS */}
      {activeTab === "subscribers" && (
        <div>
          <div style={{ backgroundColor: "var(--color-surface)", padding: "24px", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0" }}>Quick Add VIP Lead</h3>
            <form onSubmit={handleAddSubscriber} style={{ display: "flex", gap: "12px" }}>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="shopper@gmail.com" style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--color-outline-variant)" }} required />
              <button type="submit" className="btn-primary" style={{ padding: "10px 24px", fontWeight: 700 }}>Add</button>
            </form>
          </div>

          <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant)", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Subscribers Database</h3>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Filter email..." style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid var(--color-outline-variant)" }} />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px" }}>Email Address</th>
                  <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "12px" }}>Date</th>
                  <th style={{ padding: "12px 20px", textAlign: "right", fontSize: "12px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600 }}>{s.email}</td>
                    <td style={{ padding: "14px 20px", color: "var(--color-on-surface-variant)" }}>{s.date}</td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <button onClick={() => handleDeleteSub(s.id, s.email)} style={{ color: "#b41e1e", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST HISTORY */}
      {activeTab === "history" && (
        <div style={{ backgroundColor: "var(--color-surface)", borderRadius: "16px", border: "1px solid var(--color-outline-variant)", overflow: "hidden" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-container-low)" }}>
            <h3 style={{ margin: 0 }}>Sent Campaigns Broadcast History</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                <th style={{ padding: "16px 20px", fontSize: "12px" }}>Broadcast Date</th>
                <th style={{ padding: "16px 20px", fontSize: "12px" }}>Campaign Subject</th>
                <th style={{ padding: "16px 20px", fontSize: "12px" }}>Recipients</th>
                <th style={{ padding: "16px 20px", fontSize: "12px" }}>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--color-outline-variant)" }}>
                  <td style={{ padding: "16px 20px", color: "var(--color-on-surface-variant)" }}>{c.date}</td>
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-primary)" }}>{c.subject}</td>
                  <td style={{ padding: "16px 20px" }}>📨 {c.recipients} mailboxes</td>
                  <td style={{ padding: "16px 20px", color: "#0a4d3c", fontWeight: 700 }}>✅ Delivered 100%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* GMAIL MAILBOX INTERACTIVE SIMULATOR MODAL */}
      {previewModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", width: "100%", maxWidth: "900px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
            {/* Modal Bar */}
            <div style={{ backgroundColor: "#202124", padding: "14px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ backgroundColor: "#ea4335", color: "#fff", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>GMAIL</span>
                <span style={{ fontWeight: 700, fontSize: "15px" }}>Subscriber Mailbox View Mockup</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={copyHTMLCode} style={{ backgroundColor: "#fed65b", color: "#00241b", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>
                  📋 Copy HTML Email
                </button>
                <button onClick={() => setPreviewModalOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer" }}>✕</button>
              </div>
            </div>

            {/* Gmail Client Web Simulation */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Fake Gmail Sidebar */}
              <div style={{ width: "200px", backgroundColor: "#f6f8fc", padding: "16px", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ backgroundColor: "#c2e7ff", color: "#001d35", padding: "10px 16px", borderRadius: "24px", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>📥</span> Inbox (1)
                </div>
                <div style={{ padding: "8px 16px", color: "#444", fontSize: "13px" }}>⭐ Starred</div>
                <div style={{ padding: "8px 16px", color: "#444", fontSize: "13px" }}>📨 Sent</div>
                <div style={{ padding: "8px 16px", color: "#444", fontSize: "13px" }}>🏷️ Promotions</div>
              </div>

              {/* Main Mail Reading Pane */}
              <div style={{ flex: 1, padding: "32px", overflowY: "auto", backgroundColor: "#ffffff" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 16px 0", color: "#202124" }}>{subject}</h2>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#00241b", color: "#fed65b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px" }}>MJ</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}>Marbie Jewels Concierge &lt;concierge@marbiejewels.com&gt;</div>
                      <div style={{ fontSize: "12px", color: "#777" }}>to subscribed.user@gmail.com • Just now</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "20px", color: "#fbbc04" }}>★</span>
                </div>

                {/* Email Template Rendering */}
                <div style={{ maxWidth: "620px", margin: "0 auto", backgroundColor: "#fcf9f8", border: "1px solid #eaeaea", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                  {banner && <img src={banner} alt="Broadcast Banner" style={{ width: "100%", maxHeight: "300px", objectFit: "cover", display: "block" }} />}
                  <div style={{ padding: "40px 36px", textAlign: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#00241b", margin: "0 0 16px 0" }}>{title}</h3>
                    <div style={{ color: "#735c00", fontSize: "18px", marginBottom: "24px" }}>❧ ✿ ❧</div>
                    <p style={{ fontSize: "15px", color: "#333", lineHeight: 1.8, whiteSpace: "pre-line", textAlign: "left", margin: "0 0 36px 0" }}>{letterBody}</p>
                    <a href={ctaLink} style={{ backgroundColor: "#00241b", color: "#fed65b", padding: "18px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "13px", letterSpacing: "3px", display: "inline-block", boxShadow: "0 8px 20px rgba(0,36,27,0.2)" }}>
                      {ctaText}
                    </a>
                  </div>
                  <div style={{ backgroundColor: "#00241b", color: "rgba(255,255,255,0.6)", padding: "24px", textAlign: "center", fontSize: "11px", letterSpacing: "1px" }}>
                    © 2026 Marbie Jewels Royal Concierge • Sent to your subscribed Gmail account • Unsubscribe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
