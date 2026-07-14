import classNames from 'classnames';

export const SELECT_CONTROL_HEIGHT_PX = 38;

export function getSelectClassNames({ error = false, disabled = false } = {}) {
    return {
        container: () => 'w-full',
        control: (state) =>
            classNames(
                'form-input flex items-center !py-0',
                error && 'form-input-error',
                disabled && 'cursor-not-allowed bg-slate-100',
                !disabled &&
                    !error &&
                    state.isFocused &&
                    'border-primary-500 ring-2 ring-primary-500/20',
            ),
        valueContainer: () => 'gap-1 p-0',
        placeholder: () => 'text-slate-400',
        input: () => 'm-0 p-0 text-sm text-slate-900',
        singleValue: () => 'text-sm text-slate-900',
        multiValue: () => 'rounded-md bg-primary-50 text-primary-800',
        multiValueLabel: () => 'px-1.5 py-0.5 text-xs font-medium',
        multiValueRemove: () =>
            'rounded-r-md px-1 text-primary-600 hover:bg-primary-100 hover:text-primary-800',
        indicatorsContainer: () => 'flex shrink-0 items-center self-stretch',
        clearIndicator: () => 'cursor-pointer px-1 text-slate-400 hover:text-slate-600',
        dropdownIndicator: () => 'cursor-pointer px-1 text-slate-400 hover:text-slate-600',
        menu: () => 'mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg',
        menuList: () => 'max-h-60 overflow-y-auto py-1',
        option: (state) =>
            classNames(
                'cursor-pointer px-3 py-2 text-sm',
                state.isSelected && 'bg-primary-50 font-medium text-primary-900',
                state.isFocused && !state.isSelected && 'bg-slate-50 text-slate-900',
                !state.isSelected && !state.isFocused && 'text-slate-900',
                state.isDisabled && 'cursor-not-allowed text-slate-400',
            ),
        noOptionsMessage: () => 'px-3 py-2 text-sm text-slate-500',
    };
}

export function getSelectControlStyles() {
    const height = `${SELECT_CONTROL_HEIGHT_PX}px`;

    return {
        control: (base) => ({
            ...base,
            minHeight: height,
            height,
        }),
        valueContainer: (base) => ({
            ...base,
            padding: 0,
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
        }),
        indicatorsContainer: (base) => ({
            ...base,
            padding: 0,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
    };
}
