import "./globals.css";

export const metadata = {
  title: "$GOAL — Vote & Burn · World Cup 2026",
  description:
    "Predict every World Cup 2026 match. Community votes drive a deflationary $GOAL burn at full time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}