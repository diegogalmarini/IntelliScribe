import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Landing/Navbar';
import { Footer } from '../components/Footer';
import { UserProfile } from '../types';
import { blogPosts, BlogPost } from '../utils/blogData';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    ArrowLeft,
    ArrowRight,
    User,
    GraduationCap,
    BadgeCheck,
    Clock,
    Share2,
    Twitter,
    Linkedin,
    Link as LinkIcon,
    Loader2,
    Check
} from 'lucide-react';

interface BlogProps {
    user: UserProfile;
}

const MarkdownComponents = {
    h1: ({ children }: any) => <h1 className="text-3xl md:text-4xl font-bold mt-12 mb-6 text-slate-900 dark:text-white tracking-tight">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-5 text-slate-900 dark:text-white tracking-tight">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{children}</h3>,
    p: ({ children }: any) => <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg font-light">{children}</p>,
    ul: ({ children }: any) => <ul className="list-disc pl-6 mb-6 space-y-3 text-slate-700 dark:text-slate-300">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-6 space-y-3 text-slate-700 dark:text-slate-300">{children}</ol>,
    li: ({ children }: any) => <li className="text-lg font-light leading-relaxed">{children}</li>,
    strong: ({ children }: any) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-primary/30 pl-6 my-8 italic text-slate-600 dark:text-slate-400">
            {children}
        </blockquote>
    ),
    table: ({ children }: any) => (
        <div className="overflow-x-auto my-10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <table className="w-full text-left border-collapse bg-slate-50/50 dark:bg-white/[0.02]">
                {children}
            </table>
        </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 uppercase text-[10px] font-bold tracking-widest text-slate-500">{children}</thead>,
    th: ({ children }: any) => <th className="px-6 py-4">{children}</th>,
    td: ({ children }: any) => <td className="px-6 py-4 border-b border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 font-light">{children}</td>,
    a: ({ children, href }: any) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 inline-flex items-center gap-1 group"
        >
            {children}
            <LinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    ),
};

export const Blog: React.FC<BlogProps> = ({ user }) => {
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Newsletter state
    const [subEmail, setSubEmail] = useState('');
    const [subAccepted, setSubAccepted] = useState(false);
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [subMessage, setSubMessage] = useState('');

    const pathParts = location.pathname.split('/');
    const currentSlug = pathParts[2];
    const currentPost = blogPosts ? blogPosts.find(p => p.slug === currentSlug) : null;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (currentPost) {
            document.title = `${currentPost.title} | Diktalo Blog`;
        } else {
            document.title = `Blog | Diktalo`;
        }
    }, [location.pathname, currentPost]);

    const handleNavigate = (path: string) => {
        if (path === '/') navigate('/');
        else navigate(path);
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subEmail || !subAccepted) return;

        setSubStatus('loading');
        try {
            const response = await fetch('/api/newsletter-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: subEmail,
                    legalAccepted: subAccepted,
                    metadata: { path: location.pathname }
                })
            });

            const data = await response.json();
            if (data.success) {
                setSubStatus('success');
                setSubMessage(data.alreadySubscribed
                    ? '¡Ya estás suscrito!'
                    : '¡Gracias! Revisa tu email para confirmar la suscripción.');
            } else {
                throw new Error(data.error || 'Error al suscribir');
            }
        } catch (error: any) {
            setSubStatus('error');
            setSubMessage(error.message);
        }
    };

    const readingTime = (text: string) => {
        const wordsPerMinute = 200;
        const words = text.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest z-50 shadow-2xl animate-bounce';
        toast.innerText = 'Enlace copiado al portapapeles';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    const shareOnTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`He leído "${currentPost?.title}" en el blog de Diktalo. ¡Totalmente recomendado!`);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const renderIndex = () => (
        <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4 block">Nuestro Conocimiento</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">
                        Insights de <span className="text-primary italic">Inteligencia</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
                        Exploramos la frontera entre el lenguaje humano y la eficiencia artificial.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {blogPosts.map((post, idx) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -8 }}
                            onClick={() => navigate(`/blog/${post.slug}`)}
                            className="glass-card group cursor-pointer overflow-hidden flex flex-col h-full border border-slate-200 dark:border-white/5 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.imageAlt}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-4 text-xs font-medium text-slate-400">
                                    <span>{new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {readingTime(post.content)} min
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-snug text-slate-900 dark:text-white">
                                    {post.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-8 flex-1 leading-relaxed font-light">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center text-primary font-bold text-sm tracking-tight group">
                                    Explorar artículo
                                    <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPost = (post: BlogPost) => (
        <div className="pt-32 pb-24">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center text-slate-500 hover:text-primary transition-all mb-10 group bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-full w-fit hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider">Volver al blog</span>
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                            {post.category}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                            <Clock size={14} />
                            {readingTime(post.content)} min lectura
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                        {post.title}
                    </h1>

                    <div className="flex items-center gap-4 p-1 bg-slate-50 dark:bg-white/5 rounded-full pr-6 w-fit border border-slate-200 dark:border-white/10">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden">
                            {post.authorImage ? (
                                <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{post.author}</span>
                                {post.authorLinkedIn && (
                                    <a
                                        href={post.authorLinkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-[#0077b5] transition-colors"
                                    >
                                        <Linkedin size={14} />
                                    </a>
                                )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{post.authorRole || 'Editorial Diktalo'}</div>
                        </div>
                    </div>
                </motion.div>

                <div className="rounded-3xl overflow-hidden mb-16 shadow-2xl relative group">
                    <img src={post.image} alt={post.imageAlt} className="w-full h-auto transform group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* --- AEO ANSWER BOX --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-primary/5 dark:bg-blue-900/10 border-l-4 border-primary p-10 rounded-r-3xl mb-16 relative overflow-hidden group shadow-lg"
                >
                    <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <GraduationCap size={80} />
                    </div>
                    <div className="text-primary font-bold text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center">
                        <BadgeCheck size={18} className="mr-2" />
                        Executive Summary (AEO Optimized)
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 text-xl leading-relaxed italic font-medium relative z-10">
                        "{post.aeoAnswer}"
                    </p>
                </motion.div>

                {/* Share bar */}
                <div className="flex items-center justify-between mb-16 py-6 border-y border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compartir</span>
                        <div className="flex gap-2">
                            <button onClick={shareOnTwitter} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-all"><Twitter size={18} /></button>
                            <button onClick={shareOnLinkedIn} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-all"><Linkedin size={18} /></button>
                            <button onClick={copyToClipboard} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 hover:text-primary transition-all"><LinkIcon size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="article-content max-w-none mb-20">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-3">
                    {post.tags.map(tag => (
                        <span key={tag} className="bg-slate-100 dark:bg-white/5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-primary/10 hover:text-primary transition-all cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Newsletter Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mt-28 p-12 md:p-16 glass-card border border-primary/20 bg-primary/5 rounded-[3rem] text-center relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                    <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">Escale su inteligencia con Diktalo</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-10 max-w-md mx-auto leading-relaxed font-light">
                        Únase a los líderes que ya están transformando su flujo de trabajo conversacional en una ventaja competitiva.
                    </p>

                    {subStatus === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-6 rounded-3xl max-w-md mx-auto"
                        >
                            <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold mb-2">
                                <Check size={24} />
                                {subMessage}
                            </div>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="max-w-xl mx-auto relative z-10">
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <input
                                    type="email"
                                    required
                                    value={subEmail}
                                    onChange={(e) => setSubEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    disabled={subStatus === 'loading'}
                                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all shadow-inner disabled:opacity-50"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!subAccepted || subStatus === 'loading'}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-primary text-white font-bold py-4 px-10 rounded-2xl hover:bg-primary-dark shadow-xl hover:shadow-primary/20 transition-all whitespace-nowrap disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                                >
                                    {subStatus === 'loading' ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        'Suscribirme'
                                    )}
                                </motion.button>
                            </div>

                            <div className="flex items-start gap-3 px-4 text-left">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        id="legal"
                                        checked={subAccepted}
                                        onChange={(e) => setSubAccepted(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 dark:border-white/10 text-primary focus:ring-primary bg-white dark:bg-slate-900 transition-all cursor-pointer accent-primary"
                                    />
                                </div>
                                <label htmlFor="legal" className="text-xs text-slate-500 dark:text-slate-400 leading-normal cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                    Acepto recibir comunicaciones de Diktalo y confirmo que he leído la <a href="/privacy" className="text-primary hover:underline font-semibold">Política de Privacidad</a>.
                                </label>
                            </div>

                            {subStatus === 'error' && (
                                <p className="mt-4 text-rose-500 text-sm font-medium">
                                    {subMessage}
                                </p>
                            )}
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-[#0b0f17] transition-colors duration-300 gpu-accelerated">
            <Navbar user={user} onNavigate={handleNavigate} />

            <main className="w-full">
                {currentPost ? renderPost(currentPost) : renderIndex()}
            </main>

            <Footer />
        </div>
    );
};
