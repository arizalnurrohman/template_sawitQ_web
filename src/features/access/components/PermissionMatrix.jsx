import { ACCESS_ACTIONS, ACTION_LABELS } from "../../../config/access.js";
import "../../access/access.css";

export default function PermissionMatrix({
  menus = [],
  value = {},
  onChange,
  onToggleAll,
  readOnly = false,
}) {
  return (
    <div className="matrix-wrap">
      <table className="matrix-table">
        <thead>
          <tr>
            <th>Menu</th>
            {ACCESS_ACTIONS.map((action) => (
              <th key={action}>{ACTION_LABELS[action]}</th>
            ))}
            <th>Semua</th>
          </tr>
        </thead>
        <tbody>
          {menus.length === 0 ? (
            <tr>
              <td colSpan={ACCESS_ACTIONS.length + 2} className="matrix-empty">
                Belum ada menu. Buat menu terlebih dahulu.
              </td>
            </tr>
          ) : (
            menus.map((menu) => {
              const current = value[menu.id] || {};
              const all = ACCESS_ACTIONS.every((action) => current[action]);
              return (
                <tr key={menu.id}>
                  <td>
                    <strong>{menu.label}</strong>
                    <small>{menu.path}</small>
                  </td>
                  {ACCESS_ACTIONS.map((action) => (
                    <td className="matrix-cell" key={action}>
                      {readOnly ? (
                        <span
                          className={`matrix-mark ${current[action] ? "yes" : "no"}`}
                          aria-label={`${ACTION_LABELS[action]} ${current[action] ? "diizinkan" : "tidak diizinkan"}`}
                        >
                          {current[action] ? "✓" : "—"}
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          aria-label={`${ACTION_LABELS[action]} ${menu.label}`}
                          checked={Boolean(current[action])}
                          onChange={(event) =>
                            onChange?.(menu.id, action, event.target.checked)
                          }
                        />
                      )}
                    </td>
                  ))}
                  <td className="matrix-cell">
                    {readOnly ? (
                      <span className={`matrix-mark ${all ? "yes" : "no"}`}>
                        {all ? "✓" : "—"}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        aria-label={`Semua akses ${menu.label}`}
                        checked={all}
                        onChange={(event) =>
                          onToggleAll?.(menu.id, event.target.checked)
                        }
                      />
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
