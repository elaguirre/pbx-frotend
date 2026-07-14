import { InputWrapper } from './InputWrapper';
import { SearchableSelectControl } from './SearchableSelectControl';

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
    isMulti = false,
}) {
    const inputId = name;

    return (
        <InputWrapper label={label} error={error}>
            <SearchableSelectControl
                inputId={inputId}
                name={name}
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                error={error}
                isMulti={isMulti}
            />
        </InputWrapper>
    );
}
