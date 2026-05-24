import axios from 'axios';

const urlBase = 'shipment-routes';

export const shipmentRouteService = {
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

    moveUp(id, params = {}) {
        return axios.post(`${urlBase}/${id}/move-up`, null, { params }).then((res) => res.data);
    },

    moveDown(id, params = {}) {
        return axios.post(`${urlBase}/${id}/move-down`, null, { params }).then((res) => res.data);
    },
};
