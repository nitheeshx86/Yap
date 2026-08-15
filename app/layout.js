import "./globals.css";

export const metadata = {
  title: "Yap",
  description: "Yap — speak · practice · evolve",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
