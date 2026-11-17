import { dateTime } from "../../../lib/format.js";
import { logTypes, recordTypes } from "../constants.js";
import "../monitoring.css";

export default function ActivityRow({ item, isLog }) {
  return (
    <tr>
      <td>
        <div className="activity-record">
          <strong>
            {isLog ? item.description || item.action : item.title}
          </strong>
          <small>
            {isLog
              ? `${item.actor_name || "Pelaku tidak tercatat"} · ${logTypes[item.entity_type] || item.entity_type}`
              : recordTypes[item.type] || item.type}
          </small>
        </div>
      </td>
      <td>
        <span className="activity-context">
          {isLog ? item.kebun_lokasi || "Kebun tidak tersedia" : item.context}
        </span>
      </td>
      <td>
        <span className="table-date">
          {dateTime(isLog ? item.created_at : item.occurred_at)}
        </span>
      </td>
    </tr>
  );
}
