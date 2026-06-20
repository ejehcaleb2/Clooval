/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from "axios";
import { useAuthStore } from "./store";

// Central Axios Client
const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cl_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept 401 responses to auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and logout
      useAuthStore.getState().logout();
      // Wait, we can let routing trigger redirect
    }
    return Promise.reject(error);
  }
);
