import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4">
      <div className="flex justify-between items-center container mx-auto">
        <Link to="/" className="text-xl font-bold">
          MedRisk AI
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/assessment" className="hover:text-blue-600">Assessment</Link>
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}