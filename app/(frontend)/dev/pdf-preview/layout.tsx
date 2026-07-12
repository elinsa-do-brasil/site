import { notFound } from "next/navigation";

export default function PdfPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#525659",
      }}
    >
      {children}
    </div>
  );
}
