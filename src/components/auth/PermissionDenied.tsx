import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PermissionDenied() {
    const navigate = useNavigate();

    return (
        <div className="page-transition min-h-[80vh] flex items-center justify-center p-6">
            <div className="text-center max-w-md animate-scale-in">
                <div className="w-24 h-24 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-8 shadow-glow-destructive">
                    <ShieldAlert className="w-12 h-12 text-destructive animate-pulse" />
                </div>
                <h1 className="font-grotesk font-bold text-4xl mb-4 gradient-text from-destructive to-rose-500">
                    Access Denied
                </h1>
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                    It looks like you don't have the necessary permissions to view this section.
                    Please contact the administrator or switch to an authorized account.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-outline flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary flex items-center justify-center gap-2 shadow-glow"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
}
