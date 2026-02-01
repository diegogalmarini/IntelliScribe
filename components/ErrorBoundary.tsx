import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5">
                    <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">No pudimos cargar esta sección. Por favor, intenta recargar la página.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold"
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
