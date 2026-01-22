import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/src/assets/citeon-logo.jpg"
                        alt="CITEON"
                        className="h-20 w-20 mx-auto rounded-full ring-4 ring-primary-500/50 mb-4"
                    />
                    <h1 className="text-4xl font-bold gradient-text mb-2">CITEON</h1>
                    <p className="text-dark-400">AI-Powered Hiring Platform</p>
                </div>

                <Card>
                    <h2 className="text-2xl font-bold text-dark-50 mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger-500/20 border border-danger-500/30 text-danger-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                            icon={<LogIn className="w-5 h-5" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-dark-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
