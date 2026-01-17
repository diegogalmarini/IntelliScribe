import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualHighlighterProps {
    targetId: string | null;
    onClose?: () => void;
    duration?: number;
}

export const VisualHighlighter: React.FC<VisualHighlighterProps> = ({
    targetId,
    onClose,
    duration = 5000
}) => {
    const [bounds, setBounds] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!targetId) {
            setBounds(null);
            return;
        }

        const updateBounds = () => {
            const el = document.getElementById(targetId);
            if (el) {
                setBounds(el.getBoundingClientRect());
            } else {
                setBounds(null);
            }
        };

        updateBounds();

        // Listen for scroll/resize to keep highlight in sync
        window.addEventListener('resize', updateBounds);
        window.addEventListener('scroll', updateBounds, true);

        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);

        return () => {
            window.removeEventListener('resize', updateBounds);
            window.removeEventListener('scroll', updateBounds, true);
            clearTimeout(timer);
        };
    }, [targetId, duration, onClose]);

    if (!bounds || !targetId) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2147483646] pointer-events-none">
                {/* Visual Rings */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    style={{
                        position: 'absolute',
                        top: bounds.top,
                        left: bounds.left,
                        width: bounds.width,
                        height: bounds.height,
                        borderRadius: '8px',
                        border: '4px solid #F59E0B', // Amber 500
                        boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.4)',
                    }}
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                        style={{
                            position: 'absolute',
                            inset: -12,
                            borderRadius: '12px',
                            border: '2px solid #F59E0B',
                        }}
                    />

                    {/* Pulsing Dot in corner if applicable, or center */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full shadow-lg border-2 border-white animate-pulse" />
                </motion.div>

                {/* Spotlight Mask (Optional but adds premium feel) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900"
                    style={{
                        clipPath: `polygon(
                            0% 0%, 
                            0% 100%, 
                            ${bounds.left}px 100%, 
                            ${bounds.left}px ${bounds.top}px, 
                            ${bounds.left + bounds.width}px ${bounds.top}px, 
                            ${bounds.left + bounds.width}px ${bounds.top + bounds.height}px, 
                            ${bounds.left}px ${bounds.top + bounds.height}px, 
                            ${bounds.left}px 100%, 
                            100% 100%, 
                            100% 0%
                        )`
                    }}
                />
            </div>
        </AnimatePresence>
    );
};
