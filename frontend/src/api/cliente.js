/*

import axios from "axios";
import authService from "../services/authService";

const client = axios.create({
  baseURL: "",
});

client.interceptors.request.use((config) => {
  const session = authService.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

export default client; */
