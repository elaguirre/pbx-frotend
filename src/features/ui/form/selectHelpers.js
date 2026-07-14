export function resolveSelectValue(options, value, isMulti = false) {
    if (isMulti) {
        const values = Array.isArray(value)
            ? value.map(String)
            : value === null || value === undefined || value === ''
              ? []
              : String(value).split(',').filter(Boolean);

        return options.filter((option) => values.includes(String(option.value)));
    }

    if (value === null || value === undefined) {
        return null;
    }

    return options.find((option) => String(option.value) === String(value)) ?? null;
}

export function createSelectChangeHandler(name, onChange, isMulti = false) {
    if (!onChange) {
        return undefined;
    }

    return (selected) => {
        const nextValue = isMulti
            ? (selected?.map((option) => option.value) ?? [])
            : (selected?.value ?? '');

        onChange({
            target: {
                name,
                value: nextValue,
                type: isMulti ? 'select-multiple' : 'select-one',
            },
            currentTarget: {
                name,
                value: nextValue,
            },
        });
    };
}

export function getSelectRequiredValue(value, isMulti = false) {
    if (isMulti) {
        return Array.isArray(value) ? value.join(',') : (value ?? '');
    }

    return value ?? '';
}
