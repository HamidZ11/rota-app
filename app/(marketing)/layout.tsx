import { Inter } from "next/font/google";
import PublicNavbar from "./components/PublicNavbar";
import PublicFooter from "./components/PublicFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} min-h-screen bg-[#FAFAF9] font-[var(--font-inter)] text-[#292524]`}
    >
      <div className="relative min-h-screen">
        <PublicNavbar />
        {children}
        <PublicFooter />
      </div>
    </div>
  );
}
