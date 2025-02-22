import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar */}
        <nav className="navbar flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 text-4xl">medical_services</span>
            <h1 className="text-2xl font-bold text-gray-900">MedRisk AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <Link to="/assessment" className="hover:text-blue-600">Assessment</Link>
            <Link to="/dashboard" className="primary-btn">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="text-center mb-20">
          <h1 className="mb-6">AI-Powered Medical Risk Analysis</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced predictive analytics for early detection of health risks using machine learning models
          </p>
          <Link to="/assessment" className="primary-btn text-lg px-10 py-4">
            Start Risk Assessment
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">clinical_notes</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Analysis</h3>
            <p className="text-gray-600">Multi-factor risk assessment using latest medical research</p>
          </div>
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">monitor_heart</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">Track health metrics and risk factors over time</p>
          </div>
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">security</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600">Secure patient data with enterprise-grade encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}