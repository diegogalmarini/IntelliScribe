import React from 'react';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { LegalSidebar } from '../components/Legal/LegalSidebar';

interface LegalLayoutProps {
    children: React.ReactNode;
    title?: string;
    lastUpdated?: string;
}

// ... imports

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
    return (
        <div className="landing-page bg-white dark:bg-background-dark min-h-screen font-sans transition-colors duration-300 flex flex-col">
            <Navbar />

            <div className="flex-grow pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                        {/* Sidebar */}
                        <LegalSidebar />

                        {/* Content */}
                        <main className="flex-1 min-w-0 legal-page">
                            {title && (
                                <div className="mb-12">
                                    <h1 className="text-slate-900 dark:text-white mb-4">
                                        {title}
                                    </h1>
                                    {lastUpdated && (
                                        <p className="text-slate-500 text-sm mt-0!">{/* override legal-p margin-top */}
                                            Updated: {lastUpdated}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};
