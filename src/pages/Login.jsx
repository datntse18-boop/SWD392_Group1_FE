import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, Bike } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { loginUser } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(email, password);
            const token = data.token || data.accessToken;
            localStorage.setItem('accessToken', token);
            localStorage.setItem('user', JSON.stringify(data.user || data));

            // Decode token to get role claim
            const decoded = jwtDecode(token);
            const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (role === 'Admin') {
                navigate('/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.response?.data?.title ||
                'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* ====== LEFT – Hero Panel ====== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#FF7A2F] via-[#F56218] to-[#D94E0A]">
                {/* SVG pattern */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Floating circles */}
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 animate-float" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/3 right-1/5 w-32 h-32 rounded-full bg-white/8 animate-float" style={{ animationDelay: '4s' }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-16 text-white text-center">
                    <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl animate-slide-up">
                        <Bike className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight mb-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        CycleTrust
                    </h1>

                    <div className="w-12 h-1 bg-white/30 rounded-full mb-5 animate-slide-up" style={{ animationDelay: '0.15s' }} />

                    <p className="text-lg text-white/85 max-w-sm leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        The trusted marketplace for
                        <span className="font-semibold"> new and pre-owned bicycles</span>
                    </p>

                    {/* Stats */}
                    <div className="mt-14 flex gap-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        {[
                            { num: '10K+', label: 'Bikes Sold' },
                            { num: '50K+', label: 'Users' },
                            { num: '99%', label: 'Satisfaction' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <p className="text-3xl font-extrabold">{item.num}</p>
                                <p className="text-xs text-white/50 mt-1 font-medium uppercase tracking-wider">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    <p className="absolute bottom-8 text-white/25 text-xs font-medium tracking-wide">
                        Every bike is quality-inspected before listing
                    </p>
                </div>
            </div>

            {/* ====== RIGHT – Login Form ====== */}
            <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
                <div className="w-full max-w-[400px] animate-fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Bike className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold text-foreground">CycleTrust</span>
                    </div>

                    <Card className="shadow-xl border-0 shadow-black/5">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                            <CardDescription>Enter your credentials to continue</CardDescription>
                        </CardHeader>

                        <CardContent>
                            {/* Error */}
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2 animate-slide-up">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="pl-10 h-11"
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 h-11"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot */}
                                <div className="text-right">
                                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Submit */}
                                <Button type="submit" disabled={loading} className="w-full h-11 font-semibold cursor-pointer">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="justify-center pb-6">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have an account?{' '}
                                <a href="#" className="font-semibold text-primary hover:underline">
                                    Sign Up
                                </a>
                            </p>
                        </CardFooter>
                    </Card>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                        © 2026 CycleTrust. Trusted bicycle marketplace.
                    </p>
                </div>
            </div>
        </div>
    );
}
