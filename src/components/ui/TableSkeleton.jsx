import "./DataTable.css";

export default function TableSkeleton({ columns, rows = 4 }) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr key={rowIndex} aria-hidden="true">
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td key={columnIndex}>
          <span className="skeleton table-skeleton" />
        </td>
      ))}
    </tr>
  ));
}
