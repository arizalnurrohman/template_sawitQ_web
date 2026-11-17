import "../auth.css";

export default function LoginFooter() {
  return (
    <footer className="login-footer">
      <span>© {new Date().getFullYear()} SawitQ. Semua hak dilindungi.</span>
      <span className="footer-dot" /> Developer Console v0.1
    </footer>
  );
}
