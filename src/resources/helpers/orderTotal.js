export function getConceptLineTotal(concept) {
    const unitPrice =
        concept.price != null ? Number(concept.price) : Number(concept.product?.price ?? 0);

    return unitPrice * Number(concept.quantity ?? 0);
}

export function getOrderTotal(concepts = []) {
    return concepts.reduce((sum, concept) => sum + getConceptLineTotal(concept), 0);
}
