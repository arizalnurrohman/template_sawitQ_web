import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import Page from "../layouts/Page.jsx";
import Alert from "../components/ui/Alert.jsx";
import Panel from "../components/ui/Panel.jsx";
import useApiResource from "../hooks/useApiResource.js";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";
import PermissionMatrix from "../features/access/components/PermissionMatrix.jsx";
import { toMatrix } from "../features/access/permissionUtils.js";
import "../features/access/access.css";

export default function Permissions() {
  const { token } = useAuth();
  const roles = useApiResource("/admin/roles");
  const menus = useApiResource("/admin/menus");
  const [roleId, setRoleId] = useState("");
  const [matrix, setMatrix] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleItems = Array.isArray(roles.data) ? roles.data : roles.data?.data || [];
  const menuItems = Array.isArray(menus.data) ? menus.data : menus.data?.data || [];
  const selectedRole = roleItems.find((role) => String(role.id) === String(roleId));

  useEffect(() => {
    if (!roleId && roleItems.length) setRoleId(String(roleItems[0].id));
  }, [roleItems, roleId]);

  useEffect(() => {
    if (!roleId) {
      setMatrix({});
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    request(`/admin/roles/${roleId}`, { token, signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        const permissions =
          response.data?.permissions ?? response.data?.role?.permissions;
        setMatrix(toMatrix(permissions));
      })
      .catch((failure) => {
        if (controller.signal.aborted) return;
        setError(failure.message);
        setMatrix({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [roleId, token]);

  return (
    <Page
      title="Peta hak akses"
      eyebrow="PENDUKUNG"
      description="Lihat ringkasan izin tiap role terhadap seluruh menu tanpa mengubah data."
      footer="Untuk mengubah akses, gunakan menu Manajemen Role"
    >
      <Panel title="Pilih role" description="Matrix menampilkan aksi yang diizinkan untuk role terpilih.">
        {roles.loading ? (
          <p className="cell-muted">Memuat role…</p>
        ) : roles.error ? (
          <Alert>{roles.error}</Alert>
        ) : (
          <div className="role-summary">
            {roleItems.map((role) => (
              <button
                type="button"
                key={role.id}
                className="button button-outline"
                aria-pressed={String(role.id) === String(roleId)}
                onClick={() => setRoleId(String(role.id))}
              >
                {role.name}
              </button>
            ))}
          </div>
        )}
      </Panel>

      <div className="crud-toolbar" style={{ marginTop: 22 }}>
        <div>
          <h2>{selectedRole ? `Akses · ${selectedRole.name}` : "Belum ada role dipilih"}</h2>
          <p>Tanda ✓ berarti aksi diizinkan untuk role tersebut.</p>
        </div>
      </div>

      {error && <div className="notice"><Alert>{error}</Alert></div>}
      {menus.error && <div className="notice"><Alert>{menus.error}</Alert></div>}

      <PermissionMatrix
        menus={menuItems}
        value={matrix}
        readOnly
      />

      {!loading && Object.keys(matrix).length === 0 && (
        <p className="cell-muted" style={{ marginTop: 12 }}>
          <KeyRound size={13} /> Role ini belum memiliki izin yang tersimpan.
        </p>
      )}
    </Page>
  );
}
