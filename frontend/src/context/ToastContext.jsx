import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const Toast = ({ toast, onRemove }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        warning: <AlertTriangle className="text-amber-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColors[toast.type]} animate-slide-in`}>
            {icons[toast.type]}
            <div className="flex-1">
                {toast.title && (
                    <p className="font-semibold text-slate-800">{toast.title}</p>
                )}
                <p className="text-sm text-slate-600">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((toast) => {
        const id = Date.now();
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, toast.duration || 4000);

        return id;
    }, [removeToast]);

    const success = useCallback((message, title) => {
        return addToast({ type: 'success', message, title });
    }, [addToast]);

    const error = useCallback((message, title) => {
        return addToast({ type: 'error', message, title });
    }, [addToast]);

    const warning = useCallback((message, title) => {
        return addToast({ type: 'warning', message, title });
    }, [addToast]);

    const info = useCallback((message, title) => {
        return addToast({ type: 'info', message, title });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto md:w-80 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
