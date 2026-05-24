import axios from 'axios';

const urlBase = 'cities';

export const cityService = {
    getAll(params = {}) {
        return axios
            .get(urlBase, { params: { paginated: false, limit: 5000, ...params } })
            .then((res) => res.data);
    },
};
