import axios from "axios";
import config from '../config';

const api = axios.create();

api.interceptors.request.use(
  async request => {
    const baseURL = config.API_BASE_URL || '';
    request.url = baseURL + request.url;

    return request;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;