import axios from 'axios';

const urlBase = 'admins';

export const adminService = {
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

    getAbilities(id) {
        return axios.get(`${urlBase}/${id}/abilities`).then((res) => res.data);
    },

    updateAbilities(id, abilityIds) {
        return axios
            .put(`${urlBase}/${id}/abilities`, { ability_ids: abilityIds })
            .then((res) => res.data);
    },
};
