import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { XStack, Stack, styled } from 'tamagui';

const SwitchContainer = styled(XStack, {
    borderRadius: 100,
    backgroundColor: '$background',
    borderColor: '$borderColor',
    borderWidth: 1,
    padding: 2,
    position: 'fixed',
    zIndex: 100,
    elevation: '$4',
    cursor: 'pointer',
    animation: 'bouncy',
    hoverStyle: {
        scale: 1.05,
    }
})

const IconWrapper = styled(Stack, {
    borderRadius: 100,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    animation: 'quick',
    pressStyle: {
        opacity: 0.7
    },
    variants: {
        active: {
            true: {
                backgroundColor: '$color', // Theme text color (inverted bg)
            },
            false: {
                backgroundColor: 'transparent',
            }
        }
    }
})

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
        <SwitchContainer className="fixed bottom-24 right-5 md:bottom-6 md:right-6">
            {/* Light Mode Side */}
            <IconWrapper
                active={!isDark}
                onPress={() => setMode('light')}
            >
                <Sun
                    size={16}
                    // If active (Light mode), icon should be inverse color (white/dark bg). 
                    // If inactive (Dark mode), icon should be subdued.
                    // Using direct colors for clarity in this specific UI pattern
                    color={!isDark ? (isDark ? '#000' : '#fff') : '#94a3b8'}
                    style={{ strokeWidth: 2.5 }}
                />
            </IconWrapper>

            {/* Dark Mode Side */}
            <IconWrapper
                active={isDark}
                onPress={() => setMode('dark')}
            >
                <Moon
                    size={16}
                    color={isDark ? (isDark ? '#000' : '#fff') : '#94a3b8'}
                    style={{ strokeWidth: 2.5 }}
                />
            </IconWrapper>
        </SwitchContainer>
    );
};
