import ReactSelect from 'react-select';
import { getSelectClassNames, getSelectControlStyles } from './selectClassNames';
import {
    createSelectChangeHandler,
    getSelectRequiredValue,
    resolveSelectValue,
} from './selectHelpers';

const menuPortalTarget = typeof document !== 'undefined' ? document.body : null;

export function SearchableSelectControl({
    name,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccionar...',
    required = false,
    disabled = false,
    error = null,
    isMulti = false,
    className,
    inputId,
}) {
    const selectedValue = resolveSelectValue(options, value, isMulti);
    const classNames = getSelectClassNames({ error: Boolean(error), disabled });

    return (
        <div className="relative">
            <ReactSelect
                unstyled
                inputId={inputId}
                instanceId={inputId ?? name}
                name={name}
                className={className}
                classNames={classNames}
                getOptionValue={(option) => String(option.value)}
                getOptionLabel={(option) => option.label ?? ''}
                options={options}
                value={selectedValue}
                onChange={createSelectChangeHandler(name, onChange, isMulti)}
                placeholder={placeholder}
                isDisabled={disabled}
                isMulti={isMulti}
                isSearchable
                isClearable={false}
                menuPortalTarget={menuPortalTarget}
                menuPosition="fixed"
                styles={getSelectControlStyles()}
                noOptionsMessage={() => 'Sin coincidencias'}
                loadingMessage={() => 'Cargando...'}
            />
            {required && (
                <input
                    tabIndex={-1}
                    aria-hidden="true"
                    name={name}
                    value={getSelectRequiredValue(value, isMulti)}
                    required
                    onChange={() => {}}
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                />
            )}
        </div>
    );
}
