import { History } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import DataTable from "../../../components/ui/DataTable.jsx";
import FilterSelect from "../../../components/ui/FilterSelect.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import SegmentedControl from "../../../components/ui/SegmentedControl.jsx";
import usePaginatedResource from "../../../hooks/usePaginatedResource.js";
import { logTypes, monitoringViews, recordTypes } from "../constants.js";
import ActivityRow from "./ActivityRow.jsx";
import "../monitoring.css";

export default function ActivityFeed({ view, onViewChange, revision }) {
  const isLog = view === "logs";
  const types = isLog ? logTypes : recordTypes;
  const endpoint = isLog ? "/admin/activity-logs" : "/admin/activities";
  const { result, filter, setFilter, page, setPage, reload } =
    usePaginatedResource(endpoint, { filterName: "type", revision });

  return (
    <>
      <div className="activity-toolbar">
        <SegmentedControl
          label="Jenis pemantauan"
          value={view}
          onChange={onViewChange}
          options={monitoringViews}
        />
        <FilterSelect
          label="Modul"
          ariaLabel="Filter modul aktivitas"
          value={filter}
          onChange={setFilter}
          allLabel="Semua modul"
          options={Object.entries(types).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
      <p className="monitoring-note">
        {isLog
          ? "Log perubahan kebun yang telah direkam aplikasi; bukan catatan semua klik, login, atau aktivitas sebelum pencatatan aktif."
          : "Menampilkan kondisi terbaru setiap data, bukan histori setiap perubahan. Pengeluaran otomatis yang terhubung ke perawatan aktif tidak ditampilkan dua kali."}
      </p>
      <DataTable
        ariaLabel={isLog ? "Log perubahan kebun" : "Data terbaru aplikasi"}
        columns={[
          isLog ? "Perubahan / Pelaku" : "Data / Modul",
          "Konteks kebun",
          isLog ? "Waktu tercatat" : "Terakhir diperbarui",
        ]}
        data={result.data}
        loading={result.loading}
        error={result.error}
        errorTitle="Aktivitas belum dapat dimuat"
        onRetry={reload}
        emptyTitle={
          isLog
            ? "Belum ada log perubahan tercatat"
            : "Belum ada data untuk ditampilkan"
        }
        emptyDescription={
          filter
            ? "Coba pilih modul lain atau tampilkan semua modul."
            : "Data akan tampil di sini setelah tersedia di aplikasi."
        }
        emptyIcon={History}
        emptyAction={
          filter && (
            <Button variant="text" onClick={() => setFilter("")}>
              Tampilkan semua modul
            </Button>
          )
        }
        renderRow={(item) => (
          <ActivityRow key={item.id} item={item} isLog={isLog} />
        )}
      />
      <Pagination
        result={result}
        page={page}
        onPageChange={setPage}
        itemLabel={isLog ? "log" : "data"}
        loadingLabel="Memuat aktivitas…"
        previousLabel="Aktivitas sebelumnya"
        nextLabel="Aktivitas berikutnya"
      />
    </>
  );
}
