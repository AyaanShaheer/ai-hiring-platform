import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { UserPlus } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        company_name: '',
        role: 'recruiter' as 'recruiter' | 'viewer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
                    <h2 className="text-2xl font-bold text-dark-50 mb-6">Create Account</h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-danger-500/20 border border-danger-500/30 text-danger-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            name="full_name"
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="email"
                            name="email"
                            label="Email Address"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="text"
                            name="company_name"
                            label="Company Name"
                            placeholder="Acme Inc."
                            value={formData.company_name}
                            onChange={handleChange}
                        />

                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            helperText="Minimum 8 characters"
                        />

                        <div>
                            <label className="block text-sm font-medium text-dark-200 mb-2">
                                Role <span className="text-danger-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg glass border border-white/10 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                                required
                            >
                                <option value="recruiter">Recruiter</option>
                                <option value="viewer">Viewer</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                            icon={<UserPlus className="w-5 h-5" />}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-dark-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
