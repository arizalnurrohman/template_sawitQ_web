import Badge from "../../../components/ui/Badge.jsx";
import { paymentStatuses } from "../../../lib/format.js";

export default function PaymentStatus({ status }) {
  const details = paymentStatuses[status] || {
    label: status || "Tidak diketahui",
    tone: "neutral",
  };
  return <Badge tone={details.tone}>{details.label}</Badge>;
}
