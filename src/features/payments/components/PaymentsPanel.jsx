import { ArrowDownLeft, CreditCard } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import FilterSelect from "../../../components/ui/FilterSelect.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import Panel from "../../../components/ui/Panel.jsx";
import { paymentStatuses } from "../../../lib/format.js";
import PaymentRow from "./PaymentRow.jsx";
import "../payments.css";

const statusOptions = Object.entries(paymentStatuses).map(
  ([value, { label }]) => ({ value, label }),
);

export default function PaymentsPanel({ resource }) {
  const { result, page, setPage, filter, setFilter, reload } = resource;
  return (
    <Panel
      className="payments-panel"
      title="Transaksi terbaru"
      description="Daftar pembayaran paket Pro dari seluruh pengguna."
      icon={ArrowDownLeft}
    >
      <div className="table-toolbar">
        <span className="table-label">
          <span className="tiny-dot green" /> Pembayaran Pro
        </span>
        <FilterSelect
          label="Status"
          ariaLabel="Filter status pembayaran"
          value={filter}
          onChange={setFilter}
          allLabel="Semua status"
          options={statusOptions}
        />
      </div>
      <DataTable
        ariaLabel="Transaksi pembayaran Pro"
        columns={["Pengguna / Transaksi", "Tanggal", "Nominal", "Status"]}
        data={result.data}
        loading={result.loading}
        error={result.error}
        errorTitle="Transaksi belum dapat dimuat"
        onRetry={reload}
        emptyTitle={
          filter
            ? "Belum ada transaksi dengan status ini"
            : "Belum ada transaksi"
        }
        emptyDescription="Pembayaran pengguna akan tampil di sini setelah tersedia."
        emptyIcon={CreditCard}
        emptyAction={
          filter && (
            <Button variant="text" onClick={() => setFilter("")}>
              Tampilkan semua status
            </Button>
          )
        }
        renderRow={(payment) => (
          <PaymentRow key={payment.id} payment={payment} />
        )}
      />
      <Pagination
        result={result}
        page={page}
        onPageChange={setPage}
        itemLabel="transaksi"
        loadingLabel="Memuat transaksi…"
      />
    </Panel>
  );
}
