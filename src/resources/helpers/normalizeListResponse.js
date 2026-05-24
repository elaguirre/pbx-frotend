/**
 * Normaliza respuestas de listados API (array plano o paginado con `data`).
 */
export function normalizeListResponse(response) {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
}
