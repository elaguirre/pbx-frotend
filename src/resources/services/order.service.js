import axios from 'axios';

const urlBase = 'orders';

export const orderService = {
    getAll(params = {}) {
        return axios.get(urlBase, { params: { paginated: true, ...params } }).then((res) => res.data);
    },

    get(id, params = {}) {
        return axios.get(`${urlBase}/${id}`, { params }).then((res) => res.data);
    },

    getCurrent(params = {}) {
        return axios
            .get(`${urlBase}/current`, { params: { include: 'client.entity,concepts.product', ...params } })
            .then((res) => res.data);
    },

    start(clientId) {
        return axios.post(`${urlBase}/start`, { client_id: clientId }).then((res) => res.data);
    },

    checkout(orderId) {
        return axios.post(`${urlBase}/${orderId}/checkout`).then((res) => res.data);
    },

    update(id, values) {
        return axios.put(`${urlBase}/${id}`, values).then((res) => res.data);
    },

    destroy(id) {
        return axios.delete(`${urlBase}/${id}`).then((res) => res.data);
    },
};
