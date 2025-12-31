import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerProps {
    timeout: number;
    onIdle: () => void;
    onActive?: () => void;
    debounce?: number;
}

export const useIdleTimer = ({
    timeout,
    onIdle,
    onActive,
    debounce = 500
}: UseIdleTimerProps) => {
    const [isIdle, setIsIdle] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleActivity = useCallback(() => {
        setIsIdle(false);
        lastActivityRef.current = Date.now();
        if (onActive) onActive();

        if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
        }

        idleTimeoutRef.current = setTimeout(() => {
            setIsIdle(true);
            onIdle();
        }, timeout);
    }, [timeout, onIdle, onActive]);

    useEffect(() => {
        // Events to listen for
        const events = ['mousemove', 'keydown', 'wheel', 'touchstart', 'click'];

        let lastTrigger = 0;
        const throttledHandler = () => {
            const now = Date.now();
            if (now - lastTrigger > debounce) {
                handleActivity();
                lastTrigger = now;
            }
        };

        // Initial setup
        handleActivity();

        // Attach listeners
        events.forEach(event => {
            window.addEventListener(event, throttledHandler);
        });

        return () => {
            // Cleanup and remove listeners
            events.forEach(event => {
                window.removeEventListener(event, throttledHandler);
            });
            if (idleTimeoutRef.current) {
                clearTimeout(idleTimeoutRef.current);
            }
        };
    }, [handleActivity, debounce]);

    return {
        isIdle,
        resetTimer: handleActivity
    };
};
