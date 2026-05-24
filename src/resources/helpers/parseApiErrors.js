/**
 * Maps Laravel validation errors to a flat { field: message } object.
 */
export function parseApiErrors(error) {
    if (error?.response?.status !== 422) {
        return null;
    }

    const parsed = {};

    Object.entries(error.response.data?.errors || {}).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length) {
            parsed[field] = messages[0];
        }
    });

    return parsed;
}
