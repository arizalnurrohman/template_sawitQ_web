import { ArrowUpRight, Check, Crown, ShieldCheck } from "lucide-react";
import { number, rupiah } from "../../../lib/format.js";
import "../payments.css";

export default function PlanCard({ plan, loading }) {
  return (
    <section className="plan-card">
      <div className="plan-card-heading">
        <span className="plan-crown">
          <Crown size={21} />
        </span>
        <span>PAKET SAWITQ</span>
        <ArrowUpRight size={18} />
      </div>
      <h2>{plan?.pro_name || "Pro"}</h2>
      <p>
        {plan
          ? "Satu kali pembayaran. Manfaat jangka panjang."
          : loading
            ? "Memuat konfigurasi paket…"
            : "Konfigurasi paket belum tersedia dari API."}
      </p>
      <div className="plan-price">
        {loading ? "…" : rupiah(plan?.pro_price)}
        <span>/ lifetime</span>
      </div>
      <div className="plan-detail">
        <span>
          <Check size={15} /> Kuota foto Pro
        </span>
        <strong>{plan ? `${number(plan.pro_photo_mb)} MB` : "—"}</strong>
      </div>
      <div className="plan-detail">
        <span>
          <Check size={15} /> Batas kebun Free
        </span>
        <strong>{plan ? `${number(plan.free_kebun_max)} kebun` : "—"}</strong>
      </div>
      <div className="plan-readonly">
        <ShieldCheck size={13} /> Konfigurasi ditampilkan dalam mode baca.
      </div>
    </section>
  );
}
