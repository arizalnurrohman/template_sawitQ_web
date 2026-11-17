import "./FilterSelect.css";

export default function FilterSelect({
  label,
  ariaLabel,
  value,
  onChange,
  options = [],
  allLabel,
}) {
  return (
    <label className="filter-select">
      {label}
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
