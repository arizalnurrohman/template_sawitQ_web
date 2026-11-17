import "./FormField.css";

export default function FormField({
  label,
  id,
  icon: Icon,
  endAdornment,
  ...inputProps
}) {
  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        {Icon && <Icon size={18} />}
        <input {...inputProps} id={id} />
        {endAdornment}
      </div>
    </>
  );
}
