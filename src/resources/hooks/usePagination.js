import { useMemo } from 'react';
import { range } from '@resources/helpers';

export function usePagination({ totalRecords, perPage, siblingCount, currentPage }) {
    return useMemo(() => {
        let leftDots = false;
        let rightDots = false;
        let middleRange = [];

        const totalPages = Math.ceil(totalRecords / perPage) || 1;
        const siblingToShow = Math.min(siblingCount, totalPages - 2);
        const middleSibling = Math.floor(siblingToShow / 2);

        const enableDots = totalPages - 2 > siblingCount;

        if (enableDots && currentPage > 2 + middleSibling) {
            leftDots = true;
        }

        if (enableDots && currentPage < totalPages - (1 + middleSibling)) {
            rightDots = true;
        }

        const lengthRange = Math.min(siblingToShow, totalPages - middleSibling);
        const startRange = currentPage - middleSibling;

        middleRange = range(
            Math.min(Math.max(startRange, 2), totalPages - siblingToShow),
            lengthRange
        );

        return {
            totalPages,
            middleRange,
            leftDots,
            rightDots,
        };
    }, [totalRecords, perPage, siblingCount, currentPage]);
}
