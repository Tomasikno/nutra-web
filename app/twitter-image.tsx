import { ImageResponse } from "next/og";

export const alt = "Nutra | Meal planning and nutrition coach";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 85% 20%, rgba(122,170,134,0.36) 0%, rgba(122,170,134,0) 45%), linear-gradient(125deg, #0D4715 0%, #41644A 60%, #5A8A66 100%)",
          color: "#EBE1D1",
          padding: "42px 50px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 26,
            border: "2px solid rgba(235,225,209,0.26)",
            background: "rgba(13,71,21,0.24)",
            padding: "34px 38px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -58,
              bottom: -58,
              width: 230,
              height: 230,
              borderRadius: 999,
              background: "rgba(233,118,43,0.16)",
              border: "2px solid rgba(233,118,43,0.55)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 830, zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                borderRadius: 999,
                border: "1px solid rgba(233,118,43,0.75)",
                background: "rgba(233,118,43,0.2)",
                color: "#EBE1D1",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 0.8,
                padding: "8px 18px",
              }}
            >
              NUTRA
            </div>
            <div style={{ fontSize: 60, lineHeight: 1.02, fontWeight: 800 }}>Plan meals with AI</div>
            <div style={{ fontSize: 30, lineHeight: 1.18, opacity: 0.96 }}>
              Stay consistent with nutrition, one week at a time.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
