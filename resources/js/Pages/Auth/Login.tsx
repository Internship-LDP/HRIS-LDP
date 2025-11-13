import InputError from '@/Components/InputError';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Head, Link, useForm } from '@inertiajs/react';
import { gsap } from 'gsap';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

const logo = '/img/LogoLDP.png';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    type ExtendedErrors = typeof errors & {
        credentials?: string;
        account_status?: string;
    };
    const typedErrors = errors as ExtendedErrors;
    const credentialError = typedErrors.credentials;
    const inactiveMessage = typedErrors.account_status;
    const [showInactiveDialog, setShowInactiveDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inactiveMessage) {
            setShowInactiveDialog(true);
        }
    }, [inactiveMessage]);

    useEffect(() => {
        if (containerRef.current) {
            gsap.from(containerRef.current, {
                opacity: 0,
                duration: 0.4,
            });
        }

        if (cardRef.current) {
            gsap.from(cardRef.current, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                delay: 0.15,
                ease: 'power3.out',
            });
        }
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 px-4 py-10 text-gray-900">
                <div className="pointer-events-none absolute top-16 right-10 size-72 rounded-full bg-purple-400/20 blur-3xl" />
                <div
                    className="pointer-events-none absolute bottom-10 left-10 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl"
                    style={{ animationDelay: '1s' }}
                />

                <div
                    ref={containerRef}
                    className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center"
                >
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-purple-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Beranda
                        </Link>

                        <div
                            ref={cardRef}
                            className="rounded-2xl border border-purple-100 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
                        >
                            <div className="mb-8 text-center">
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-purple-50">
                                    <img
                                        src={logo}
                                        alt="Lintas Data Prima"
                                        className="h-12 w-12 object-contain"
                                    />
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Selamat Datang Kembali
                                </h1>
                                <p className="mt-2 text-sm text-gray-600">
                                    Masuk ke akun Lintas Data Prima Anda
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {status}
                                </div>
                            )}

                            {credentialError && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {credentialError}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="email"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            autoComplete="username"
                                            className="h-12 rounded-xl border-gray-200 bg-white pl-11 text-base focus-visible:border-purple-500 focus-visible:ring-purple-500"
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.email}
                                        className="text-sm text-red-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="password"
                                            className="text-sm font-medium text-gray-700"
                                        >
                                            Kata Sandi
                                        </label>
                                        {/* {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm font-medium text-purple-600 hover:text-purple-700"
                                            >
                                                Lupa kata sandi?
                                            </Link>
                                        )} */}
                                    </div>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            className="h-12 rounded-xl border-gray-200 bg-white pl-11 pr-12 text-base focus-visible:border-purple-500 focus-visible:ring-purple-500"
                                            onChange={(e) =>
                                                setData('password', e.target.value)
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => !prev)
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="text-sm text-red-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-700">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData('remember', e.target.checked)
                                            }
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        Ingat saya
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-base font-semibold text-white shadow-lg shadow-purple-200 transition hover:from-purple-700 hover:to-purple-600"
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </Button>
                            </form>

                            <div className="mt-8 text-center text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-semibold text-purple-600 hover:text-purple-700"
                                >
                                    Daftar sekarang
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {inactiveMessage && (
                <AlertDialog
                    open={showInactiveDialog}
                    onOpenChange={setShowInactiveDialog}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Akun Dinonaktifkan</AlertDialogTitle>
                            <AlertDialogDescription>
                                {inactiveMessage}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction autoFocus>
                                Mengerti
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
}
