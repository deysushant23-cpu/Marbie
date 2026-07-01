"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
  folder?: string;
}

export default function ImageUpload({ onUploadSuccess, buttonText = "Choose File", folder = "marbie-bridal/general" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onUploadSuccess(data.url);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ marginTop: "4px" }}>
      <input
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleUpload}
      />
      <button
        type="button"
        className="primary-button"
        style={{
          padding: "6px 12px",
          fontSize: "11px",
          backgroundColor: isUploading ? "var(--color-surface-container-highest)" : "var(--color-surface-container)",
          color: isUploading ? "var(--color-on-surface-variant)" : "var(--color-on-surface)",
          border: "1px solid var(--color-outline)",
          borderRadius: "4px",
          cursor: isUploading ? "not-allowed" : "pointer"
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : buttonText}
      </button>
    </div>
  );
}
