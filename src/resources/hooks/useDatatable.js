import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@resources/helpers';

/**
 * Provides states and controls for a paginated datatable.
 */
export function useDatatable(params) {
    const {
        service = null,
        source = null,
        serviceParams = {},
        query = '',
        page = 1,
        limit = 15,
        sort = '',
        filter = {},
        debounceTime = 500,
        paginated = true,
    } = params || {};

    const [requestParams, setRequestData] = useState({
        query,
        page,
        limit,
        sort,
        filter,
        paginated,
    });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(paginated ? { data: [] } : []);
    const [sortBy, setSortBy] = useState('');
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        updateList();
    }, [requestParams]);

    function updateList() {
        if (typeof source === 'function') {
            setLoading(true);
            setData(paginated ? { data: [] } : []);

            source(requestParams)
                .then(setData)
                .finally(() => setLoading(false));
        }

        if (typeof service?.getAll === 'function') {
            setLoading(true);
            setData(paginated ? { data: [] } : []);

            service
                .getAll({
                    ...requestParams,
                    ...serviceParams,
                })
                .then(setData)
                .finally(() => setLoading(false));
        }
    }

    function setRequestDataSpread(spreadData) {
        setRequestData((current) => ({ ...current, page: 1, ...spreadData }));
    }

    function setPage(nextPage) {
        setRequestDataSpread({ page: nextPage });
    }

    function setLimit(nextLimit) {
        setRequestDataSpread({ limit: nextLimit });
    }

    function setQuery(nextQuery) {
        setRequestDataSpread({ query: nextQuery });
    }

    function setSort(column) {
        const ascending = column !== sortBy ? true : !sortAsc;

        setSortBy(column);
        setSortAsc(ascending);
        setRequestDataSpread({
            sort: `${ascending ? '' : '-'}${column}`,
        });
    }

    function setFilter(name, value) {
        setRequestDataSpread({
            filter: {
                ...requestParams.filter,
                [name]: value,
            },
        });
    }

    return {
        data,
        controls: {
            setPage,
            setLimit,
            setQuery: useCallback(debounce(setQuery, debounceTime), []),
            setFilter,
            sort: {
                column: sortBy,
                asc: sortAsc,
                setColumn: setSort,
            },
        },
        loading,
        updateList,
        requestParams,
        setFilter,
        filters: requestParams.filter,
    };
}
