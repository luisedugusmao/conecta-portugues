import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ floating = true, className = "" }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const setMode = (mode) => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        }
    };

    const containerClasses = floating
        ? "fixed bottom-24 right-5 md:bottom-6 md:right-6 z-[100] shadow-xl hover:scale-105"
        : "relative shadow-sm border-slate-100 dark:border-slate-700";

    return (
        <div className={`flex items-center bg-white dark:bg-slate-800 border rounded-full p-0.5 transition-transform duration-300 ${containerClasses} ${className}`}>
            <button
                onClick={() => setMode('light')}
                className={`p-1.5 rounded-full transition-all duration-300 ${!isDark ? 'bg-amber-100 text-amber-500 shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Sun size={14} />
            </button>
            <button
                onClick={() => setMode('dark')}
                className={`p-1.5 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-100 text-indigo-500 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Moon size={14} />
            </button>
        </div>
    );
};
