import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios base URL (match backend PORT)
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Setup Axios Interceptors
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Header is handled by interceptor now, but keeping for safety
                const res = await axios.get('/auth/me');
                setUser(res.data);
                return res.data;
            } catch (error) {
                console.error("Auth Check Failed", error);
                // 401 handled by interceptor
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        const checkLoggedIn = async () => {
            await fetchUser();
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post('/auth/register', userData);
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const refreshUser = async () => {
        return await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

