import React from "react";
import { Link } from "react-router-dom"; // Add this import
import "../style.css";
export default function Home() { // Changed from MyPlugin to default export
  return (
    <div id="webcrumbs"> 
      <div className="w-[1280px] font-sans relative overflow-hidden">
        {/* ... other elements ... */}
        
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b">
          <div className="flex items-center justify-between px-8">
            {/* ... logo section ... */}
            <div className="flex items-center gap-8">
              <Link to="/" className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">
                Home
              </Link>
              <Link to="/assessment" className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">
                Take Assessment
              </Link>
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">
                Dashboard
              </Link>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:scale-105">
                Login
              </button>
            </div>
          </div>
        </nav>
    	
    	  <main className="px-8 py-12">
    	    <section className="text-center transform translate-y-0 opacity-100 transition-all duration-1000">
    	      <h1 className="text-6xl font-bold mb-6 animate-fadeIn">AI-Powered Medical Risk Analyzer</h1>
    	      <p className="text-xl mb-8 max-w-2xl mx-auto animate-slideUp">Advanced artificial intelligence to analyze your health risks and provide personalized insights for better healthcare decisions.</p>
    	      <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl animate-bounce">Take Assessment</button>
    	    </section>
    	
    	    <section className="mt-20 grid grid-cols-3 gap-8">
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">assessment</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Risk Assessment</h2>
    	        <p>Advanced AI algorithms analyze your health data to identify potential risks.</p>
    	      </div>
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">analytics</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Health Analytics</h2>
    	        <p>Comprehensive analysis of your health metrics with detailed insights.</p>
    	      </div>
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">medication</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Personalized Care</h2>
    	        <p>Tailored recommendations based on your unique health profile.</p>
    	      </div>
    	    </section>
    	
    	    <section className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
    	      <h2 className="text-3xl font-bold mb-8">Quick Assessment</h2>
    	      <div className="space-y-6">
    	        <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50">
    	          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
    	          <div className="grid grid-cols-2 gap-4">
    	            <input type="text" placeholder="Age" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300" />
    	            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300">
    	              <option>Select Gender</option>
    	              <option>Male</option>
    	              <option>Female</option>
    	              <option>Other</option>
    	            </select>
    	          </div>
    	        </div>
    	        <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50">
    	          <h3 className="text-xl font-semibold mb-4">Symptoms</h3>
    	          <div className="grid grid-cols-2 gap-4">
    	            <label className="flex items-center gap-2 cursor-pointer group">
    	              <input type="checkbox" className="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300" />
    	              <span className="group-hover:text-blue-600 transition-colors">Headache</span>
    	            </label>
    	            <label className="flex items-center gap-2 cursor-pointer group">
    	              <input type="checkbox" className="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300" />
    	              <span className="group-hover:text-blue-600 transition-colors">Fever</span>
    	            </label>
    	          </div>
    	        </div>
    	      </div>
    	      <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl">Continue Assessment</button>
    	    </section>
    	  </main>
    	</div> 
            </div>
  )
}
