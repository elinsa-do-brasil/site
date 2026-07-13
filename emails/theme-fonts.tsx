import { Font } from "react-email";

const publicURL = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "");

function getInterFontURL(filename: string) {
  return `${publicURL}/fonts/inter/${filename}`;
}

export function Fonts() {
  return (
    <>
      <Font
        fontFamily="Inter"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: getInterFontURL("regular.woff2"),
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Inter"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: getInterFontURL("medium.woff2"),
          format: "woff2",
        }}
        fontWeight={500}
        fontStyle="normal"
      />
      <Font
        fontFamily="Inter"
        fallbackFontFamily={["Arial", "sans-serif"]}
        webFont={{
          url: getInterFontURL("semibold.woff2"),
          format: "woff2",
        }}
        fontWeight={600}
        fontStyle="normal"
      />
    </>
  );
}

export const BarebonesFonts = Fonts;
