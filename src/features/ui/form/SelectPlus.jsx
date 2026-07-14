import { IconPlus } from '@tabler/icons-react';
import { Button } from '../Button';
import { InputWrapper } from './InputWrapper';
import { SELECT_CONTROL_HEIGHT_PX } from './selectClassNames';
import { SearchableSelectControl } from './SearchableSelectControl';

export function mergeSelectPlusOption(options, option) {
    const optionValue = String(option.value);

    if (options.some((row) => String(row.value) === optionValue)) {
        return options;
    }

    return [...options, { ...option, value: optionValue }];
}

function createSelectPlusChangeEvent(name, value) {
    return {
        target: {
            name,
            value,
            type: 'select-one',
        },
        currentTarget: {
            name,
            value,
        },
    };
}

/**
 * Tras crear un registro: actualiza opciones del SelectPlus y lo deja seleccionado.
 */
export function applySelectPlusRecord({
    options = [],
    onOptionsChange,
    record,
    mapToOption,
    onSelect,
    onChange,
    name,
}) {
    const row = record?.data ?? record;

    if (!row?.id) {
        return null;
    }

    const option = mapToOption(row);
    const nextValue = String(option.value);

    onOptionsChange?.((current) => mergeSelectPlusOption(current ?? options, option));

    if (onChange && name) {
        onChange(createSelectPlusChangeEvent(name, nextValue));
    } else {
        onSelect?.(nextValue);
    }

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
    isMulti = false,
    showAdd = true,
    addLabel = 'Agregar',
    onAddClick,
}) {
    return (
        <InputWrapper label={label} error={error}>
            <div className="flex gap-2">
                <SearchableSelectControl
                    inputId={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    options={options}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    error={error}
                    isMulti={isMulti}
                    className="min-w-0 flex-1"
                />
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
                        style={{ height: `${SELECT_CONTROL_HEIGHT_PX}px` }}
                    />
                )}
            </div>
        </InputWrapper>
    );
}
