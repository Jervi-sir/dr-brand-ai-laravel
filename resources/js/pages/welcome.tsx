import { Head, Link, usePage } from '@inertiajs/react';
import { login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import chat from '@/routes/chat';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#0a0a0a] font-['Outfit',sans-serif]">
                {/* Visual Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative z-10 w-full max-w-4xl px-6 text-center animate-in fade-in duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-10 border border-blue-100 dark:border-blue-900/50">
                        <Sparkles className="size-4 animate-pulse" />
                        <span>Welcome to our AI Hub</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-zinc-900 dark:text-white mb-8">
                        Create content <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">at light speed.</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Streamline your video production workflow. From AI scripting to automated scheduling, manage it all in one clean interface.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {auth.user ? (
                            <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all">
                                <Link href={chat.index().url}>
                                    Enter Platform
                                    <ArrowRight className="ml-2 size-5" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all">
                                    <Link href={canRegister ? register() : login()}>
                                        Get Started
                                        <ArrowRight className="ml-2 size-5" />
                                    </Link>
                                </Button>
                                <Link
                                    href={login()}
                                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium transition-colors"
                                >
                                    Already have an account? Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <footer className="absolute bottom-8 w-full text-center text-zinc-400 dark:text-zinc-600 text-sm">
                    &copy; {new Date().getFullYear()} AI Content Hub. Ready for production.
                </footer>
            </div>
        </>
    );
}
