import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import useApiResource from "../hooks/useApiResource.js";
import useMutation from "../hooks/useMutation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { request } from "../lib/api.js";
import { useNavigation } from "../context/NavigationContext.jsx";

export default function ConfigPage() {
  const { can } = useNavigation();
  const { token } = useAuth();
  const resource = useApiResource("/admin/config");
  const { mutate, loading: saving, error: saveError } = useMutation();
  const [form, setForm] = useState({
    BACKUP_ENABLED: true,
    BACKUP_SCHEDULE_AT: "02:00",
    BACKUP_KEEP_DAYS: 14,
    BACKUP_ARCHIVE_PASSWORD: "",
    BACKUP_PHOTOS_DISK: "public",
    BACKUP_DB_CONNECTION: "mysql",
    GOOGLE_DRIVE_BACKUP_FOLDER_ID: "",
    GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH: "",
  });
  const [notice, setNotice] = useState("");
  const [backupLog, setBackupLog] = useState("");
  const [running, setRunning] = useState(false);
  const [driveEmail, setDriveEmail] = useState("");
  const [driveResult, setDriveResult] = useState("");

  useEffect(() => {
    if (resource.data) {
      setForm((current) => ({ ...current, ...resource.data }));
    }
  }, [resource.data]);

  const mayEdit = can("config", "edit");

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    try {
      await mutate("/admin/config", { method: "PUT", body: form });
      setNotice("Konfigurasi berhasil disimpan ke .env. Restart backend agar aktif.");
      resource.reload();
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  async function loadLog() {
    try {
      const response = await request("/admin/backup/log", { token });
      setBackupLog(response.data || "");
    } catch (failure) {
      setBackupLog(failure.message);
    }
  }

  async function clearLog() {
    try {
      await request("/admin/backup/log", { method: "DELETE", token });
      setBackupLog("");
      setNotice("Log backup dihapus.");
    } catch (failure) {
      setNotice(failure.message);
    }
  }

  async function runBackup() {
    setRunning(true);
    setNotice("");
    try {
      const response = await request("/admin/backup/run", { method: "POST", token });
      setNotice(response.message || "Backup dimulai.");
      await loadLog();
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setRunning(false);
    }
  }

  async function initDrive() {
    setRunning(true);
    setNotice("");
    try {
      const response = await request("/admin/drive/init", {
        method: "POST",
        token,
        body: { email: driveEmail || undefined },
      });
      const id = response.data?.folder_id;
      if (id) {
        setForm((current) => ({
          ...current,
          GOOGLE_DRIVE_BACKUP_FOLDER_ID: id,
        }));
        setDriveResult(`Folder ID: ${id}`);
        setNotice(response.message || "Folder backup dibuat.");
      }
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Page
      title="Konfigurasi backup"
      eyebrow="SISTEM"
      description="Atur jadwal backup database + foto ke Google Drive. Nilai disimpan ke .env backend."
      actions={
        <RefreshButton loading={resource.loading} onClick={resource.reload} />
      }
      footer="File service account JSON harus ditempatkan manual di server sesuai path"
    >
      {resource.error && <Alert>{resource.error}</Alert>}
      {saveError && <Alert>{saveError}</Alert>}
      {notice && <div className="notice"><Alert>{notice}</Alert></div>}

      <form className="crud-form" onSubmit={submit}>
        <div className="form-row">
          <div className="form-block">
            <label className="check-line">
              <input
                type="checkbox"
                checked={Boolean(form.BACKUP_ENABLED)}
                onChange={(event) => setField("BACKUP_ENABLED", event.target.checked)}
                disabled={!mayEdit}
              />
              Backup aktif
            </label>
          </div>
          <div className="form-block">
            <FormField
              label="Jadwal (HH:MM)"
              id="backup-schedule"
              value={form.BACKUP_SCHEDULE_AT}
              onChange={(event) => setField("BACKUP_SCHEDULE_AT", event.target.value)}
              disabled={!mayEdit}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-block">
            <FormField
              label="Simpan backup (hari)"
              id="backup-keep"
              type="number"
              value={form.BACKUP_KEEP_DAYS}
              onChange={(event) => setField("BACKUP_KEEP_DAYS", Number(event.target.value))}
              disabled={!mayEdit}
            />
          </div>
          <div className="form-block">
            <FormField
              label="Disk foto"
              id="backup-disk"
              value={form.BACKUP_PHOTOS_DISK}
              onChange={(event) => setField("BACKUP_PHOTOS_DISK", event.target.value)}
              disabled={!mayEdit}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-block">
            <FormField
              label="Koneksi DB"
              id="backup-db"
              value={form.BACKUP_DB_CONNECTION}
              onChange={(event) => setField("BACKUP_DB_CONNECTION", event.target.value)}
              disabled={!mayEdit}
            />
          </div>
          <div className="form-block">
            <FormField
              label="Password arsip (opsional)"
              id="backup-password"
              type="password"
              value={form.BACKUP_ARCHIVE_PASSWORD}
              onChange={(event) => setField("BACKUP_ARCHIVE_PASSWORD", event.target.value)}
              disabled={!mayEdit}
            />
          </div>
        </div>
        <div className="form-block">
          <FormField
            label="Google Drive Folder ID"
            id="backup-folder"
            value={form.GOOGLE_DRIVE_BACKUP_FOLDER_ID}
            onChange={(event) => setField("GOOGLE_DRIVE_BACKUP_FOLDER_ID", event.target.value)}
            disabled={!mayEdit}
          />
        </div>
        <div className="form-block">
          <FormField
            label="Path service account JSON"
            id="backup-sa"
            value={form.GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH}
            onChange={(event) => setField("GOOGLE_DRIVE_SERVICE_ACCOUNT_PATH", event.target.value)}
            disabled={!mayEdit}
          />
        </div>
        {mayEdit && (
          <Button type="submit" icon={Save} loading={saving} loadingText="Menyimpan…">
            Simpan konfigurasi
          </Button>
        )}
      </form>

      <div style={{ marginTop: 24 }}>
        <h2>Buat folder Drive (milik service account)</h2>
        <p className="cell-muted">
          Membuat folder backup di Drive milik service account agar tidak kena
          batas quota. Folder akan dibagikan ke email Anda.
        </p>
        <div className="form-row" style={{ marginTop: 8 }}>
          <div className="form-block">
            <FormField
              label="Email yang diberi akses"
              id="drive-share-email"
              type="email"
              value={driveEmail}
              onChange={(event) => setDriveEmail(event.target.value)}
              disabled={!mayEdit}
            />
          </div>
        </div>
        <div className="row-actions" style={{ marginTop: 8 }}>
          <Button onClick={initDrive} loading={running} loadingText="Membuat…">
            Buat folder Drive
          </Button>
        </div>
        {driveResult && (
          <p className="cell-muted" style={{ marginTop: 8 }}>
            {driveResult} (sudah diisi ke field Folder ID, simpan konfigurasi)
          </p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <h2>Uji backup manual</h2>
        <p className="cell-muted">
          Jalankan backup sekarang untuk menguji konfigurasi (memerlukan exec di server).
        </p>
        <div className="row-actions" style={{ marginTop: 8 }}>
          <Button onClick={runBackup} loading={running} loadingText="Menjalankan…">
            Jalankan backup sekarang
          </Button>
          <Button variant="outline" onClick={loadLog}>
            Muat log
          </Button>
          <Button variant="text" onClick={clearLog}>
            Hapus log
          </Button>
        </div>
        {backupLog && (
          <pre
            style={{
              marginTop: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#f7faf6",
              border: "1px solid #e2e9e2",
              borderRadius: 8,
              padding: 12,
              fontSize: 11,
              maxHeight: 240,
              overflow: "auto",
            }}
          >
            {backupLog}
          </pre>
        )}
      </div>
    </Page>
  );
}
