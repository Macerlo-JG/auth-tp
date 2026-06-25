import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
