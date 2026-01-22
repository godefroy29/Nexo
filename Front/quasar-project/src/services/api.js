import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // goes through your dev proxy
  timeout: 10000
});

export default api;
