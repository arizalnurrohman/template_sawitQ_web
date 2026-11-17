import { ShieldCheck } from "lucide-react";
import BannerIllustration from "./BannerIllustration.jsx";
import "../dashboard.css";

export default function WelcomeBanner() {
  return (
    <section className="welcome-banner">
      <div className="welcome-content">
        <span className="eyebrow">MANAJEMEN SAWITQ PRO · LINTAS PENGGUNA</span>
        <h2>
          Seluruh aplikasi.
          <br />
          <span>Satu pusat pemantauan.</span>
        </h2>
        <p>
          Pantau pengguna, kebun, data operasional, dan pembayaran Pro.
          <br className="desktop-break" /> Akses global, tanpa mengubah data
          pengguna.
        </p>
        <span className="welcome-tag">
          <ShieldCheck size={14} /> Monitoring developer · hanya baca
        </span>
      </div>
      <BannerIllustration />
    </section>
  );
}
