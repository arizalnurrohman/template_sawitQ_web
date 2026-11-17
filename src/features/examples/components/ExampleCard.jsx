import Badge from "../../../components/ui/Badge.jsx";
import Panel from "../../../components/ui/Panel.jsx";
import "./example.css";

// Contoh komponen buatan sendiri yang menyusun UI primitive yang sudah ada.
// Props:
// - icon: komponen ikon dari lucide-react
// - title, description: teks
// - tone: warna badge ("neutral" | "success" | "warning" | "danger")
// - children: konten bebas (bisa komponen lain)
export default function ExampleCard({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  children,
}) {
  return (
    <Panel title={title} description={description} icon={Icon}>
      <div className="example-card">
        <Badge tone={tone}>Contoh</Badge>
        <div className="example-card-body">{children}</div>
      </div>
    </Panel>
  );
}
