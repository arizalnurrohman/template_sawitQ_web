import { useState } from "react";
import { CircleCheck, Info, Plus, Users } from "lucide-react";
import Page from "../../layouts/Page.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormField from "../../components/ui/FormField.jsx";
import MetricCard from "../../components/ui/MetricCard.jsx";
import Panel from "../../components/ui/Panel.jsx";
import ExampleCard from "./components/ExampleCard.jsx";
import "../dashboard/dashboard.css";
import "./components/example.css";

const usageCode = `import Button from "../components/ui/Button.jsx";
import { Plus } from "lucide-react";

<Button icon={Plus} onClick={() => setOpen(true)}>
  Tambah data
</Button>

// Komponen buatan sendiri tinggal dipanggil seperti UI primitive:
<ExampleCard icon={Users} title="Ringkasan" tone="success">
  Konten apa pun di sini
</ExampleCard>`;

export default function ComponentExample() {
  const [name, setName] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  return (
    <Page
      title="Contoh komponen"
      eyebrow="PANDUAN"
      description="Halaman ini menunjukkan cara memakai UI primitive dan komponen buatan sendiri."
      footer="Menu contoh dapat dihapus dari database kapan saja"
    >
      <div className="metrics-grid">
        <MetricCard
          icon={Users}
          label="Total komponen UI"
          value="15"
          note="Tersedia di src/components/ui"
        />
        <MetricCard
          icon={CircleCheck}
          label="Status"
          value="Siap dipakai"
          note="Tidak perlu library tambahan"
          tone="blue"
        />
      </div>

      <ExampleCard
        icon={Info}
        title="Komponen buatan sendiri"
        description="ExampleCard menyusun Panel + Badge + children."
        tone="success"
      >
        <p>
          Buat file baru di folder <code>features/*/components</code>, lalu
          import di halaman. Props bersifat bebas sesuai kebutuhan.
        </p>
      </ExampleCard>

      <Panel title="Tombol & badge" description="Semua tombol memakai komponen Button yang sama.">
        <div className="crud-toolbar">
          <div className="role-summary">
            <Button icon={Plus} onClick={() => setShowAlert(true)}>
              Primer
            </Button>
            <Button variant="outline">Sekunder</Button>
            <Button variant="text">Teks</Button>
            <Button loading loadingText="Memuat…">Memuat</Button>
          </div>
          <div className="role-summary">
            <Badge tone="success">Aktif</Badge>
            <Badge tone="warning">Menunggu</Badge>
            <Badge tone="danger">Gagal</Badge>
            <Badge tone="neutral">Netral</Badge>
          </div>
        </div>
        {showAlert && (
          <Alert>
            Contoh alert. Tombol primer di atas memicu pesan ini.
          </Alert>
        )}
      </Panel>

      <Panel title="Form field" description="FormField membungkus label + input agar konsisten.">
        <div className="form-block">
          <FormField
            label="Nama"
            id="example-name"
            value={name}
            placeholder="Ketik sesuatu"
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </Panel>

      <Panel title="Tabel data" description="DataTable menangani loading, error, kosong, dan baris data.">
        <DataTable
          ariaLabel="Contoh tabel"
          columns={["Nama", "Peran", "Status"]}
          data={[
            { id: 1, name: "Admin", role: "Administrator", status: "Aktif" },
            { id: 2, name: "Petugas", role: "Operator", status: "Aktif" },
          ]}
          renderRow={(row) => (
            <tr key={row.id}>
              <td className="cell-strong">{row.name}</td>
              <td>{row.role}</td>
              <td><Badge tone="success">{row.status}</Badge></td>
            </tr>
          )}
        />
      </Panel>

      <Panel title="Contoh kode">
        <pre className="example-code">{usageCode}</pre>
      </Panel>
    </Page>
  );
}
