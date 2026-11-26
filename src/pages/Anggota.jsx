import { Users as UsersIcon } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Badge from "../components/ui/Badge.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import useApiResource from "../hooks/useApiResource.js";
import { dateTime } from "../lib/format.js";

export default function AnggotaPage() {
  const resource = useApiResource("/admin/anggota");
  const items = Array.isArray(resource.data)
    ? resource.data
    : resource.data?.data || [];

  return (
    <Page
      title="Data anggota"
      eyebrow="KUD"
      description="Daftar anggota KUD yang terhubung dengan akun pengguna."
      actions={
        <RefreshButton loading={resource.loading} onClick={resource.reload} />
      }
      footer="Data diambil dari tabel kudm_anggota yang digabung dengan users"
    >
      {resource.error && <Alert>{resource.error}</Alert>}

      <DataTable
        ariaLabel="Daftar anggota"
        columns={["Nama", "Email", "No. HP", "Alamat", "Akun user", "Status", "Dibuat"]}
        data={items}
        loading={resource.loading}
        error={resource.error}
        errorTitle="Anggota tidak dapat dimuat"
        emptyTitle="Belum ada anggota"
        emptyDescription="Data anggota akan muncul setelah ada entri di kudm_anggota."
        emptyIcon={UsersIcon}
        onRetry={resource.reload}
        renderRow={(item) => (
          <tr key={item.id}>
            <td className="cell-strong">{item.nama || item.user_name || "-"}</td>
            <td className="cell-muted">{item.email || "-"}</td>
            <td className="cell-muted">{item.no_hp || "-"}</td>
            <td className="cell-muted">{item.alamat || "-"}</td>
            <td>
              <Badge>{item.username || item.user_name || "-"}</Badge>
              {item.user_role ? (
                <span className="cell-muted"> · {item.user_role}</span>
              ) : null}
            </td>
            <td>
              <Badge tone={item.is_active === false ? "danger" : "success"}>
                {item.is_active === false ? "Nonaktif" : "Aktif"}
              </Badge>
            </td>
            <td className="cell-muted">
              {item.created_at ? dateTime(item.created_at) : "-"}
            </td>
          </tr>
        )}
      />
    </Page>
  );
}
