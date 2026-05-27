/** Normaliza relaciones del API (snake_case / camelCase). */

export function getOrderPiece(record) {
    return record?.order_piece ?? record?.orderPiece ?? null;
}

export function getProductionOrder(record) {
    return record?.production_order ?? record?.productionOrder ?? null;
}

export function getOrderConcept(record) {
    return record?.order_concept ?? record?.orderConcept ?? null;
}
