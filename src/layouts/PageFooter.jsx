import "./admin.css";

export default function PageFooter({ children }) {
  return (
    <footer className="page-footer">
      <span>
        © {new Date().getFullYear()} SawitQ <span>·</span> Tumbuh bersama,
        kelola lebih baik.
      </span>
      {children && <span>{children}</span>}
    </footer>
  );
}
