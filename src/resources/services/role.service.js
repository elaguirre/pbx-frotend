import axios from 'axios';

const urlBase = 'roles';

export const roleService = {
    getAll(params = {}) {
        return axios.get(urlBase, { params: { listed: true, ...params } }).then((res) => res.data);
    },
};
