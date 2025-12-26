import React, { useEffect, useState, useRef } from 'react';
import { useInView, motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    separator?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 2,
    prefix = '',
    suffix = '',
    separator = ','
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: duration * 1000
    });

    const displayValue = useTransform(springValue, (current) => {
        const floored = Math.floor(current);
        return `${prefix}${floored.toLocaleString('en-US').replace(/,/g, separator)}${suffix}`;
    });

    useEffect(() => {
        if (inView) {
            springValue.set(value);
        }
    }, [inView, value, springValue]);

    return <motion.span ref={ref}>{displayValue}</motion.span>;
};
