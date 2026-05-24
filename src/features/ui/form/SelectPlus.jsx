import { IconPlus } from '@tabler/icons-react';
import { Button } from '../Button';
import { InputWrapper } from './InputWrapper';

/**
 * Añade una opción al listado si aún no existe (por `value`).
 */
export function mergeSelectPlusOption(options, option) {
    if (options.some((row) => row.value === option.value)) {
        return options;
    }

    return [...options, option];
}

/**
 * Tras crear un registro: actualiza opciones del SelectPlus y lo deja seleccionado.
 */
export function applySelectPlusRecord({
    options,
    onOptionsChange,
    record,
    mapToOption,
    onSelect,
}) {
    const row = record?.data ?? record;

    if (!row?.id) {
        return null;
    }

    const option = mapToOption(row);
    const nextOptions = mergeSelectPlusOption(options, option);

    onOptionsChange(nextOptions);
    onSelect?.(option.value);

    return option;
}

export function SelectPlus({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    error = null,
    showAdd = true,
    addLabel = 'Agregar',
    onAddClick,
}) {
    return (
        <InputWrapper label={label} error={error} required={required}>
            <div className="flex gap-2">
                <select
                    name={name}
                    value={value ?? ''}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-primary-500 focus:border-primary-500 focus:ring-2 disabled:bg-slate-100"
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {showAdd && onAddClick && (
                    <Button
                        type="button"
                        variant="secondary"
                        icon={IconPlus}
                        disabled={disabled}
                        onClick={onAddClick}
                        title={addLabel}
                        aria-label={addLabel}
                        className="shrink-0 px-3"
                    />
                )}
            </div>
        </InputWrapper>
    );
}
