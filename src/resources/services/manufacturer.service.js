import axios from 'axios';

const urlBase = 'manufacturers';

export const manufacturerService = {
    getAll(params = {}) {
        const { paginated = true, ...rest } = params;
        const queryParams = { ...rest };

        if (paginated) {
            queryParams.paginated = true;
        }

        return axios.get(urlBase, { params: queryParams }).then((res) => res.data);
    },

    get(id, params = {}) {
        return axios.get(`${urlBase}/${id}`, { params }).then((res) => res.data);
    },

    store(values) {
        return axios.post(urlBase, values).then((res) => res.data);
    },

    update(id, values) {
        return axios.put(`${urlBase}/${id}`, values).then((res) => res.data);
    },

    destroy(id) {
        return axios.delete(`${urlBase}/${id}`).then((res) => res.data);
    },
};
