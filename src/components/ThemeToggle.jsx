import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
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

    return (
        <div className="fixed bottom-24 right-5 md:bottom-6 md:right-6 z-50 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-xl hover:scale-105 transition-transform duration-300">
            <button
                onClick={() => setMode('light')}
                className={`p-2 rounded-full transition-all duration-300 ${!isDark ? 'bg-amber-100 text-amber-500 shadow-sm' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setMode('dark')}
                className={`p-2 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-100 text-indigo-500 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                <Moon size={18} />
            </button>
        </div>
    );
};
