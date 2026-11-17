import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import FormField from "./FormField.jsx";

export default function PasswordField({ label = "Password", ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      {...inputProps}
      label={label}
      icon={LockKeyhole}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={visible}
          disabled={inputProps.disabled}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
