import axios from 'axios';

const urlBase = 'states';

export const stateService = {
    getAll(params = {}) {
        return axios
            .get(urlBase, { params: { paginated: false, limit: 100, ...params } })
            .then((res) => res.data);
    },
};
