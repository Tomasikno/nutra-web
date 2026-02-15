import { ImageResponse } from "next/og";

export const alt = "Nutra | Meal planning and nutrition coach";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "stretch",
          background:
            "radial-gradient(circle at 78% 18%, rgba(122,170,134,0.42) 0%, rgba(122,170,134,0) 40%), radial-gradient(circle at 14% 88%, rgba(233,118,43,0.14) 0%, rgba(233,118,43,0) 38%), linear-gradient(135deg, #0D4715 0%, #41644A 58%, #5A8A66 100%)",
          color: "#EBE1D1",
          padding: "46px 52px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: 30,
            border: "2px solid rgba(235,225,209,0.26)",
            background: "rgba(13,71,21,0.26)",
            padding: "44px 46px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: -90,
              top: -90,
              width: 280,
              height: 280,
              borderRadius: 999,
              border: "2px solid rgba(233,118,43,0.5)",
              background: "rgba(233,118,43,0.14)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                borderRadius: 999,
                border: "1px solid rgba(233,118,43,0.75)",
                background: "rgba(233,118,43,0.2)",
                color: "#EBE1D1",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: 0.9,
                padding: "10px 20px",
              }}
            >
              NUTRA
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 860 }}>
              <div style={{ fontSize: 74, lineHeight: 1.02, fontWeight: 800 }}>
                Meal planning that fits real life
              </div>
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  fontSize: 34,
                  lineHeight: 1.2,
                  color: "#EBE1D1",
                  opacity: 0.96,
                }}
              >
                Weekly plans, smart shopping lists, and AI nutrition guidance.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
