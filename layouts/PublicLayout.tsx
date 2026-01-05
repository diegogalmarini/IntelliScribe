import React from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    return (
        <div className="landing-page bg-background-light dark:bg-background-dark min-h-screen font-sans transition-colors duration-300 flex flex-col">
            <Navbar />
            <div className="flex-grow pt-20"> {/* Add padding for fixed navbar */}
                {children}
            </div>
            <Footer />
        </div>
    );
};
