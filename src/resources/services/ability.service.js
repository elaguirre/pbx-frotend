import axios from 'axios';

const urlBase = 'abilities';

export const abilityService = {
    getAll(params = {}) {
        return axios.get(urlBase, { params }).then((res) => res.data);
    },
};
