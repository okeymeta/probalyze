import React, { useState, useEffect, useRef } from 'react';
import XIcon from './icons/XIcon.tsx';

interface ModalProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Modal: React.FC<ModalProps> = ({ message, type, onClose, duration = 5000 }) => {
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setIsExiting(true);
        }, duration);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [duration]);
    
    useEffect(() => {
        if (isExiting) {
            const exitTimer = setTimeout(onClose, 400); // Match animation duration
            return () => clearTimeout(exitTimer);
        }
    }, [isExiting, onClose]);

    const handleClose = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsExiting(true);
    };

    const typeClasses = {
        success: 'bg-green-800/80 border-green-600',
        error: 'bg-red-800/80 border-red-600',
        info: 'bg-blue-800/80 border-blue-600',
    };
    
    const animationClasses = isExiting
        ? 'animate-slide-out-right'
        : 'animate-slide-in-right';

    return (
        <div 
            role="alert"
            className={`fixed top-20 right-5 w-full max-w-md p-4 rounded-xl shadow-2xl text-white backdrop-blur-sm border z-[100] overflow-hidden ${typeClasses[type]} ${animationClasses}`}
        >
            <div className="flex items-start justify-between gap-4">
                <p className="flex-grow text-base pt-1">{message}</p>
                <button 
                    onClick={handleClose} 
                    className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                    aria-label="Close notification"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div 
                className={`absolute bottom-0 left-0 h-1 bg-white/50 ${isExiting ? '' : 'animate-countdown'}`} 
                style={{ animationDuration: `${duration}ms` }}
            ></div>
        </div>
    );
};