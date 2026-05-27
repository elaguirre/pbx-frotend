import axios from 'axios';

const urlBase = 'entities';

const defaultParams = { include: 'images' };

function submit(method, url, values) {
    if (values instanceof FormData) {
        if (method === 'put') {
            values.append('_method', 'PUT');

            return axios.post(url, values).then((res) => res.data);
        }

        return axios.post(url, values).then((res) => res.data);
    }

    if (method === 'put') {
        return axios.put(url, values).then((res) => res.data);
    }

    return axios.post(url, values).then((res) => res.data);
}

export const entityService = {
    getAll(params = {}) {
        return axios
            .get(urlBase, { params: { paginated: true, ...defaultParams, ...params } })
            .then((res) => res.data);
    },

    get(id, params = {}) {
        return axios.get(`${urlBase}/${id}`, { params: { ...defaultParams, ...params } }).then((res) => res.data);
    },

    store(values) {
        return submit('post', urlBase, values);
    },

    update(id, values) {
        return submit('put', `${urlBase}/${id}`, values);
    },

    destroy(id) {
        return axios.delete(`${urlBase}/${id}`).then((res) => res.data);
    },
};
