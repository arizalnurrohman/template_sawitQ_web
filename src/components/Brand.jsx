export default function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <img src="/sawitq.png" width="42" height="42" alt="" />
      <div>
        <span className="brand-name">
          Sawit<span>Q</span>
          <span className="brand-dot">.</span>
        </span>
        <span className="brand-caption">DEVELOPER CONSOLE</span>
      </div>
    </div>
  );
}
