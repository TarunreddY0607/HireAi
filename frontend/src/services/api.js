import axios from "axios";

const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
        return base.endsWith("/api") ? base : `${base}/api`;
    }
    // When running inside Android APK (Capacitor), connect to your laptop's Wi-Fi IP
    if (typeof window !== "undefined" && (window.location.protocol === "capacitor:" || window.location.hostname === "localhost" && !window.location.port)) {
        return "http://192.168.68.105:5000/api";
    }
    return "/api";
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

export default api;