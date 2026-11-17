import Alert from "./ui/Alert.jsx";

export default function DataErrors({ errors }) {
  if (!errors.length) return null;
  return (
    <Alert className="data-alert">
      <strong>Sebagian data belum dapat dimuat.</strong>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
      <span>Periksa API, lalu gunakan tombol Perbarui.</span>
    </Alert>
  );
}
