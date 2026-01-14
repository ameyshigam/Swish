export const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

export const getServerUrl = (path = '') => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};
