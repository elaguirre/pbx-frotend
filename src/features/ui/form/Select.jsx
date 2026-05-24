import { InputWrapper } from './InputWrapper';

export function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    error = null,
}) {
    return (
        <InputWrapper label={label} error={error} required={required}>
            <select
                name={name}
                value={value ?? ''}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary-500 focus:border-primary-500 focus:ring-2 disabled:bg-slate-100"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </InputWrapper>
    );
}
