import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4" dir="rtl">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border-2 border-red-500 animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6 text-red-500">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-bold leading-relaxed">
              لقد واجه التطبيق مشكلة تقنية. يرجى محاولة إعادة تحميل الصفحة أو التواصل مع الدعم الفني.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-8 border dark:border-gray-600 text-left overflow-auto max-h-40">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">تفاصيل الخطأ</p>
              <code className="text-xs text-red-600 dark:text-red-400 font-mono">
                {this.state.error?.toString()}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-yellow-500/20 hover:bg-yellow-600 transition-all transform active:scale-95"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
