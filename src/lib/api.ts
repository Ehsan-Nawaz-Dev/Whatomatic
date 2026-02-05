import axios from 'axios';

// Switch between local admin backend (5001) and production backend
const IS_PRODUCTION = true;
const PROD_URL = "https://api.whatomatic.com/api";
const LOCAL_URL = "http://localhost:5000/api";

const API_BASE_URL = IS_PRODUCTION ? PROD_URL : LOCAL_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const adminLogin = async (credentials: any) => {
    const { data } = await api.post('/admin/login', credentials);
    return data;
};

export const fetchMerchants = async () => {
    const { data } = await api.get('/admin/merchants');
    return data;
};

export const fetchGlobalActivity = async () => {
    const { data } = await api.get('/admin/activity');
    return data;
};

export const fetchStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};

export const updateMerchantPlan = async (shopDomain: string, plan: string) => {
    const { data } = await api.post(`/admin/merchants/plan`, { shopDomain, plan });
    return data;
};

export const toggleMerchantBlock = async (shopDomain: string, isActive: boolean) => {
    const { data } = await api.post(`/admin/merchants/block`, { shopDomain, isActive });
    return data;
};

export const extendMerchantTrial = async (shopDomain: string, extraMessages: number) => {
    const { data } = await api.post(`/admin/merchants/extend-trial`, { shopDomain, extraMessages });
    return data;
};

export const cancelSubscription = async (shopDomain: string) => {
    const { data } = await api.post(`/admin/merchants/cancel-subscription`, { shopDomain });
    return data;
};

// --- Plans API ---
export const fetchPlans = async () => {
    const { data } = await api.get('/plans');
    return data;
};

export const updatePlan = async (id: string, updates: any) => {
    const { data } = await api.put(`/plans/${id}`, updates);
    return data;
};

export const createPlan = async (plan: any) => {
    const { data } = await api.post('/plans', plan);
    return data;
};

export default api;
