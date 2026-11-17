import { CalendarDays } from "lucide-react";
import "./page.css";

export default function DateChip({ date = new Date() }) {
  return (
    <span className="date-chip">
      <CalendarDays size={16} />
      {new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)}
    </span>
  );
}
