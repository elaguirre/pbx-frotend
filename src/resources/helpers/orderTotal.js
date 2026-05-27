export function getConceptLineTotal(concept) {
    const unitPrice =
        concept.price != null ? Number(concept.price) : Number(concept.product?.price ?? 0);

    return unitPrice * Number(concept.quantity ?? 0);
}

export function getOrderTotal(concepts = []) {
    return concepts.reduce((sum, concept) => sum + getConceptLineTotal(concept), 0);
}

export function getProductPiecesCount(product) {
    if (!product) {
        return 0;
    }

    if (product.pieces != null) {
        return Number(product.pieces);
    }

    if (product.product_pieces_count != null) {
        return Number(product.product_pieces_count);
    }

    if (Array.isArray(product.product_pieces)) {
        return product.product_pieces.length;
    }

    if (Array.isArray(product.productPieces)) {
        return product.productPieces.length;
    }

    return 0;
}

export function getConceptsWithProductsMissingPieces(concepts = []) {
    return concepts.filter((concept) => getProductPiecesCount(concept.product) < 1);
}

export function canCheckoutOrder(concepts = []) {
    if (!concepts?.length) {
        return false;
    }

    return getConceptsWithProductsMissingPieces(concepts).length === 0;
}
