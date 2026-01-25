import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-2xl w-full">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h2>
                        <p className="text-slate-600 mb-6">Ocorreu um erro ao carregar esta visualização.</p>

                        <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-left overflow-auto text-xs font-mono mb-6 max-h-60">
                            <p className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            {this.state.errorInfo && <pre>{this.state.errorInfo.componentStack}</pre>}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
