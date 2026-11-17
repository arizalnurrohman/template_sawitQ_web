import { ChevronLeft, ChevronRight } from "lucide-react";
import { number } from "../../lib/format.js";
import IconButton from "./IconButton.jsx";
import "./Pagination.css";

export default function Pagination({
  result,
  page,
  onPageChange,
  itemLabel = "data",
  loadingLabel = "Memuat data…",
  previousLabel = "Halaman sebelumnya",
  nextLabel = "Halaman berikutnya",
}) {
  return (
    <div className="table-footer">
      <span aria-live="polite">
        {result.loading
          ? loadingLabel
          : result.error
            ? "Data tidak tersedia"
            : `${number(result.from || 0)}–${number(result.to || 0)} dari ${number(result.total || 0)} ${itemLabel}`}
      </span>
      <div className="pagination">
        <IconButton
          label={previousLabel}
          icon={ChevronLeft}
          size={17}
          disabled={result.loading || !!result.error || page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        <span>{page}</span>
        <IconButton
          label={nextLabel}
          icon={ChevronRight}
          size={17}
          disabled={
            result.loading || !!result.error || page >= (result.last_page || 1)
          }
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  );
}
