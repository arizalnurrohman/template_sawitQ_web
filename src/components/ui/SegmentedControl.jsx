import "./SegmentedControl.css";

export default function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div className="view-switch" role="group" aria-label={label}>
      {options.map(({ value: optionValue, label: optionLabel, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          aria-pressed={value === optionValue}
          className={value === optionValue ? "selected" : ""}
          onClick={() => onChange(optionValue)}
        >
          {Icon && <Icon size={14} />}
          {optionLabel}
        </button>
      ))}
    </div>
  );
}
