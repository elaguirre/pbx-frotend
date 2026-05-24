export const ENTITY_TYPES = [
    { value: 'natural_person', label: 'Persona física' },
    { value: 'legal_person', label: 'Persona moral' },
];

export const CONTACT_DATA_TYPES = [
    { value: 'email', label: 'Correo electrónico' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'whatsapp', label: 'WhatsApp' },
];

export function getEntityTypeLabel(value) {
    return ENTITY_TYPES.find((item) => item.value === value)?.label ?? value ?? '—';
}

export function getContactDataTypeLabel(value) {
    return CONTACT_DATA_TYPES.find((item) => item.value === value)?.label ?? value ?? '—';
}

export const ENTITY_ADDRESS_TYPES = [
    { value: 'home', label: 'Domicilio' },
    { value: 'billing', label: 'Facturación / fiscal' },
    { value: 'shipping', label: 'Envío' },
    { value: 'work', label: 'Trabajo' },
    { value: 'mailing', label: 'Postal' },
];

export function getEntityAddressTypeLabel(value) {
    const typeValue = value?.value ?? value;

    return ENTITY_ADDRESS_TYPES.find((item) => item.value === typeValue)?.label ?? typeValue ?? '—';
}

