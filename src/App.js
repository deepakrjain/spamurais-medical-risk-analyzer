import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

// Modify your App component
function App() {
  return (
    <Router>
      <div className="w-[1280px] font-sans relative overflow-hidden">
        {/* Keep existing navigation exactly as is */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b">
          {/* ... existing nav content ... */}
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Dashboard</Link>
          {/* ... rest of nav ... */}
        </nav>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={
            // Paste your entire existing home page content here
            <main className="px-8 py-12">
              {/* All your existing sections */}
              <section className="text-center transform translate-y-0 opacity-100 transition-all duration-1000">
                {/* ... home page content ... */}
              </section>
            </main>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;