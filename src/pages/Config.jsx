import { useEffect, useState } from "react";
import { Save, Server } from "lucide-react";
import Page from "../layouts/Page.jsx";
import RefreshButton from "../layouts/RefreshButton.jsx";
import Alert from "../components/ui/Alert.jsx";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import useApiResource from "../hooks/useApiResource.js";
import useMutation from "../hooks/useMutation.js";
import { useNavigation } from "../context/NavigationContext.jsx";

export default function ConfigPage() {
  const { can } = useNavigation();
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
    </Page>
  );
}
