export function pricesEqual(a, b) {
    if (a == null || b == null) {
        return a == null && b == null;
    }

    return Math.abs(Number(a) - Number(b)) < 0.0001;
}

export function isPriceModified(current, original) {
    if (original == null) {
        return false;
    }

    const currentNum =
        current === '' || current == null ? Number(original) : Number(current);

    return !pricesEqual(currentNum, original);
}
