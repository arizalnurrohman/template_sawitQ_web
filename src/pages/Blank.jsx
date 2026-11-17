import Page from "../layouts/Page.jsx";

// Halaman kosong / template awal.
// Menu sudah terdaftar di src/config/routes.js, jadi rute ini bisa langsung dibuka.
// TODO: tambahkan komponen di dalam <Page> di bawah ini sesuai kebutuhan.
export default function Blank() {
  return (
    <Page
      title="Halaman kosong"
      eyebrow="TEMPLATE"
      description="Halaman ini sengaja dikosongkan sebagai titik awal modul baru."
      footer="Siap diisi komponen"
    >
      {/* Letakkan komponen di sini, misalnya: <Panel>...</Panel> */}
    </Page>
  );
}
