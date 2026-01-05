import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export const LegalSidebar: React.FC = () => {
    const location = useLocation();
    const { t } = useLanguage();

    const links = [
        { path: '/privacy', label: 'Privacy Policy' }, // Using English labels to match owner.com style/request or we can translate
        { path: '/terms', label: 'Website Terms' },
        { path: '/cookies', label: 'Cookie Policy' },
        { path: '/trust', label: 'Trust Center' },
        // { path: '/disclaimer', label: 'Disclaimer' }, // Future
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
            <nav className="flex flex-col space-y-4 md:sticky md:top-32">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                                ? 'text-primary font-bold border-l-2 border-primary pl-3'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:pl-1'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
