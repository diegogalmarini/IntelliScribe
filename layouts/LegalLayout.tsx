import React from 'react';
import { Navbar } from '../Landing/Navbar';
import { Footer } from '../Footer';
import { LegalSidebar } from './LegalSidebar';

interface LegalLayoutProps {
    children: React.ReactNode;
    title?: string;
    lastUpdated?: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
    return (
        <div className="landing-page bg-white dark:bg-background-dark min-h-screen font-sans transition-colors duration-300 flex flex-col">
            <Navbar />

            <div className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
                        {/* Sidebar */}
                        <LegalSidebar />

                        {/* Content */}
                        <main className="flex-1 min-w-0">
                            {title && (
                                <div className="mb-12">
                                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                                        {title}
                                    </h1>
                                    {lastUpdated && (
                                        <p className="text-slate-500 text-sm">Updated: {lastUpdated}</p>
                                    )}
                                </div>
                            )}

                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary-dark prose-img:rounded-xl">
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
