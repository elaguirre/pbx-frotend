import axios from 'axios';

const urlBase = 'order-pieces';

export const orderPieceService = {
    getAll(params = {}) {
        return axios.get(urlBase, { params: { paginated: true, ...params } }).then((res) => res.data);
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
