import { Database } from "lucide-react";
import Button from "./Button.jsx";
import EmptyState from "./EmptyState.jsx";
import TableSkeleton from "./TableSkeleton.jsx";
import "./DataTable.css";

export default function DataTable({
  columns,
  data = [],
  loading,
  error,
  errorTitle,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onRetry,
  emptyAction,
  renderRow,
  ariaLabel,
}) {
  return (
    <div className="table-scroll panel" aria-busy={loading}>
      <table className="data-table" aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableSkeleton columns={columns.length} />
          ) : error ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={Database}
                  title={errorTitle}
                  description={error}
                  role="alert"
                  action={
                    onRetry && (
                      <Button variant="outline" onClick={onRetry}>
                        Coba lagi
                      </Button>
                    )
                  }
                />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            data.map((item) => renderRow(item))
          )}
        </tbody>
      </table>
    </div>
  );
}
