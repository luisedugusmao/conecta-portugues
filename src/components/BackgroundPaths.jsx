import React from "react";

function FloatingPaths({ position }) {
    const paths = [
        {
            id: 1,
            d: "M-100 300 C 100 100, 300 100, 500 300 C 700 500, 900 500, 1100 300",
            color: "#a51a8f",
            width: 2,
            opacity: 0.1,
            speed: 12
        },
        {
            id: 2,
            d: "M-100 400 C 150 200, 350 200, 600 400 C 850 600, 1050 600, 1300 400",
            color: "#a51a8f",
            width: 1.5,
            opacity: 0.05,
            speed: 15
        },
        {
            id: 3,
            d: "M-100 200 C 50 400, 250 400, 450 200 C 650 0, 850 0, 1050 200",
            color: "#eec00a",
            width: 1,
            opacity: 0.08,
            speed: 8
        },
        {
            id: 4,
            d: "M-100 500 C 200 300, 400 300, 700 500 C 1000 700, 1200 700, 1500 500",
            color: "#a51a8f",
            width: 3,
            opacity: 0.03,
            speed: 10
        }
    ];

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full opacity-60 dark:opacity-40"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a51a8f" stopOpacity="0" />
                        <stop offset="50%" stopColor="#a51a8f" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#a51a8f" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {paths.map((path) => (
                    <path
                        key={path.id}
                        d={path.d}
                        stroke={path.color} // Using solid color for now, could be gradient
                        strokeWidth={path.width}
                        strokeOpacity={path.opacity}
                        fill="none"
                        className="animate-float"
                        style={{
                            animationDuration: `${path.speed}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite'
                        }}
                    />
                ))}
                {/* Animated Dashed Lines */}
                {paths.map((path) => (
                    <path
                        key={`dashed-${path.id}`}
                        d={path.d}
                        stroke={path.color}
                        strokeWidth={path.width}
                        strokeOpacity={path.opacity * 2}
                        fill="none"
                        strokeDasharray="10, 20"
                        className="animate-dash"
                        style={{
                            animationDuration: `${path.speed * 1.5}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite'
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export const BackgroundPaths = ({ children, className = "" }) => {
    return (
        <div className={`relative min-h-screen w-full overflow-hidden bg-white dark:bg-black font-sans text-slate-950 dark:text-white transition-colors duration-300 ${className}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#fdf2fa,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#2d1b36,transparent)] opacity-40"></div>
            <FloatingPaths />
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
