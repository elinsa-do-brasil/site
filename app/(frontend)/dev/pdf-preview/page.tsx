"use client";

import { useCallback, useEffect, useState } from "react";

export default function PdfPreviewPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+R / Cmd+R — refresh the PDF without full page reload
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault();
        refresh();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [refresh]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          background: "#1e1e1e",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 10,
          fontFamily: "system-ui, sans-serif",
          fontSize: 13,
          color: "#aaa",
        }}
      >
        <span>
          📄 <strong style={{ color: "#e0e0e0" }}>PDF Preview</strong>{" "}
          <span style={{ opacity: 0.5 }}>— report-pdf-document.tsx</span>
        </span>
        <button
          onClick={refresh}
          type="button"
          style={{
            background: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#ccc",
            cursor: "pointer",
            fontSize: 12,
            padding: "4px 12px",
          }}
        >
          ↻ Refresh (Ctrl+R)
        </button>
      </div>
      <iframe
        key={refreshKey}
        src="/api/dev/pdf-preview"
        title="PDF Preview"
        style={{
          position: "fixed",
          top: 40,
          left: 0,
          width: "100vw",
          height: "calc(100vh - 40px)",
          border: "none",
        }}
      />
    </>
  );
}
