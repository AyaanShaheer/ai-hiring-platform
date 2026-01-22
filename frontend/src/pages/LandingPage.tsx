import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import {
    Sparkles,
    Zap,
    Target,
    Brain,
    Shield,
    TrendingUp,
    ArrowRight,
    CheckCircle
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Matching',
            description: 'Advanced algorithms match candidates to jobs with unprecedented accuracy',
            color: 'from-cyan-500 to-blue-500',
        },
        {
            icon: Zap,
            title: 'Instant Resume Parsing',
            description: 'Extract key information from resumes in seconds with our AI parser',
            color: 'from-blue-500 to-purple-500',
        },
        {
            icon: Shield,
            title: 'Fraud Detection',
            description: 'Automatically detect and flag fraudulent resumes to protect your hiring process',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Target,
            title: 'Smart Recommendations',
            description: 'Get AI-generated insights and recommendations for every candidate',
            color: 'from-pink-500 to-red-500',
        },
        {
            icon: TrendingUp,
            title: 'Analytics Dashboard',
            description: 'Track hiring metrics and trends with comprehensive analytics',
            color: 'from-orange-500 to-yellow-500',
        },
        {
            icon: Sparkles,
            title: 'Bias Elimination',
            description: 'Ensure fair hiring with built-in bias detection and mitigation',
            color: 'from-green-500 to-cyan-500',
        },
    ];

    const benefits = [
        'Reduce time-to-hire by 60%',
        'Improve candidate quality with AI matching',
        'Eliminate bias in hiring decisions',
        'Automate repetitive screening tasks',
        'Get actionable insights from analytics',
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <img
                                src="/src/assets/citeon-logo.jpg"
                                alt="CITEON"
                                className="h-10 w-10 rounded-full ring-2 ring-cyan-500/50"
                            />
                            <div>
                                <h1 className="text-xl font-bold gradient-text">CITEON</h1>
                                <p className="text-xs text-slate-400">AI Hiring Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="primary" size="sm">
                                    Sign Up Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            <span>Powered by Advanced AI Technology</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-50 leading-tight">
                            Hire Smarter with
                            <br />
                            <span className="gradient-text">AI-Powered Recruiting</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                            Transform your hiring process with intelligent candidate matching, automated screening,
                            and data-driven insights. Find the perfect fit, faster.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="text-lg px-8 py-4"
                                    icon={<ArrowRight className="w-6 h-6" />}
                                >
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="text-lg px-8 py-4"
                                >
                                    Try Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>14-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-50 mb-4">
                            Everything You Need to Hire Better
                        </h2>
                        <p className="text-xl text-slate-400">
                            Powerful features designed to streamline your recruitment process
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                            >
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-slate-50">
                                Why Choose CITEON?
                            </h2>
                            <p className="text-lg text-slate-400">
                                Join hundreds of companies using AI to revolutionize their hiring process
                            </p>
                            <ul className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300 text-lg">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="mt-6"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                >
                                    Start Hiring Smarter
                                </Button>
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="glass rounded-2xl p-8 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                                    <div>
                                        <p className="text-sm text-slate-400">Match Score</p>
                                        <p className="text-3xl font-bold gradient-text">94%</p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-cyan-400" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                                    <div>
                                        <p className="text-sm text-slate-400">Time Saved</p>
                                        <p className="text-3xl font-bold gradient-text">60%</p>
                                    </div>
                                    <Zap className="w-12 h-12 text-purple-400" />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30">
                                    <div>
                                        <p className="text-sm text-slate-400">Quality Hires</p>
                                        <p className="text-3xl font-bold gradient-text">3x</p>
                                    </div>
                                    <Target className="w-12 h-12 text-green-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="glass rounded-3xl p-12 text-center space-y-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10" />
                        <div className="relative">
                            <h2 className="text-4xl font-bold text-slate-50 mb-4">
                                Ready to Transform Your Hiring?
                            </h2>
                            <p className="text-xl text-slate-400 mb-8">
                                Join the AI revolution in recruitment. Start your free trial today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="text-lg px-8 py-4"
                                        icon={<ArrowRight className="w-6 h-6" />}
                                    >
                                        Get Started Now
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="text-lg px-8 py-4"
                                    >
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white/5 border-t border-white/10 py-8 px-4">
                <div className="max-w-7xl mx-auto text-center text-slate-500 text-sm">
                    <p>© 2026 CITEON. All rights reserved. Powered by Advanced AI Technology.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
