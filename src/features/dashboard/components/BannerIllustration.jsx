import { Activity, CheckCheck, Sprout } from "lucide-react";
import "../dashboard.css";

export default function BannerIllustration() {
  return (
    <div className="banner-art" aria-hidden="true">
      <div className="banner-ring" />
      <div className="banner-ring ring-inner" />
      <div className="banner-leaf">
        <Sprout strokeWidth={1} />
      </div>
      <span className="banner-float float-one">
        <Activity size={17} />
        Terhubung
      </span>
      <span className="banner-float float-two">
        <CheckCheck size={18} />
        Tumbuh bersama
      </span>
      <span className="banner-spark" />
    </div>
  );
}
