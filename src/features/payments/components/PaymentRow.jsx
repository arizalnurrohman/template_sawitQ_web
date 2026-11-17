import Avatar from "../../../components/ui/Avatar.jsx";
import { dateTime, rupiah } from "../../../lib/format.js";
import PaymentStatus from "./PaymentStatus.jsx";
import "../payments.css";

export default function PaymentRow({ payment }) {
  return (
    <tr>
      <td>
        <div className="table-user">
          <Avatar name={payment.user?.name} className="table-avatar" />
          <div>
            <strong>{payment.user?.name || "Pengguna tidak tersedia"}</strong>
            <small title={payment.order_id}>{payment.order_id}</small>
          </div>
        </div>
      </td>
      <td>
        <span className="table-date">{dateTime(payment.created_at)}</span>
      </td>
      <td className="table-amount">{rupiah(payment.amount)}</td>
      <td>
        <PaymentStatus status={payment.status} />
      </td>
    </tr>
  );
}
