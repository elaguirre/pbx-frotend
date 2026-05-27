const MAIN_IMAGE_TYPE = 'MAIN';

export function getMainImage(images) {
    if (!Array.isArray(images)) {
        return null;
    }

    return images.find((image) => image.type === MAIN_IMAGE_TYPE) ?? null;
}

export function getMainImageUrl(images) {
    return getMainImage(images)?.url ?? null;
}
