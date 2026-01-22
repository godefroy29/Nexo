import api from './api';

export function getVersion() {
  return api.get('/version');
}