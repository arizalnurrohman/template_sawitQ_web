import Brand from "../../../components/Brand.jsx";
import GardenIllustration from "./GardenIllustration.jsx";
import "../auth.css";

export default function LoginStory() {
  return (
    <section className="login-story" aria-label="SawitQ Developer Console">
      <Brand light />
      <div className="story-copy">
        <span className="eyebrow">
          <span className="live-dot" /> TUMBUH BERSAMA SAWITQ
        </span>
        <h1>
          Satu aplikasi.
          <br />
          Pandangan <em>menyeluruh.</em>
        </h1>
        <p>
          Pusat monitoring developer untuk pengguna, kebun, aktivitas aplikasi,
          dan bisnis SawitQ Pro.
        </p>
      </div>
      <GardenIllustration />
      <div className="story-footer">
        <span>Untuk kebun. Untuk masa depan.</span>
        <span>01 / DEVELOPER</span>
      </div>
    </section>
  );
}
