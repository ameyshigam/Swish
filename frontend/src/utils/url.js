export const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

export const getServerUrl = (path = '') => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('https')) return path;

    // Normalize path to ensure it starts with / and uses forward slashes
    const normalizedPath = path.replace(/\\/g, '/');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';
    return `${baseUrl}${cleanPath}`;
};
