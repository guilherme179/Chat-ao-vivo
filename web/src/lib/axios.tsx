import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://10.71.201.21:2001/'
})