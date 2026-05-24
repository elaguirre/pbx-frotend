export function range(start, length) {
    return Array.from({ length }, (_, index) => start + index);
}
