import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "../style.css";

export default function Home() {
  return (
    <div id="webcrumbs">
      <Navbar /> {/* Move Navbar outside the container */}
      <div className="w-[1280px] mx-auto font-sans relative overflow-hidden">
        <main className="px-8 py-12">

        <h1 className="text-2xl font-bold mb-8 text-center">What Do We Do?</h1>
          <section className="mt-2 grid grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">assessment</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Risk Assessment</h2>
              <p>Advanced AI algorithms analyze your health data to identify potential risks.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">analytics</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Health Analytics</h2>
              <p>Comprehensive analysis of your health metrics with detailed insights.</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600 text-center">
              <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">medication</span>
              <h2 className="text-2xl font-bold mt-4 mb-2">Personalized Care</h2>
              <p>Tailored recommendations based on your unique health profile.</p>
            </div>
          </section>


          {/* New Section: How Does Our Model Work */}
          <section className="mt-20 text-center">
            <h1 className="text-2xl font-bold mb-8">How Does Our Model Work?</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto animate-slideUp">
              Our AI model works through a series of steps to assess your health risks and provide personalized insights.
            </p>

            <div className="grid grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">insert_emoticon</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 1: Enter Your Symptoms</h3>
                <p>Start by entering the symptoms you're currently experiencing. This helps us understand your health condition better.</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">dynamic_form</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 2: Dynamic Questions</h3>
                <p>Our AI model processes your symptoms and asks dynamic follow-up questions based on the information you've entered.</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group border border-blue-600">
                <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">description</span>
                <h3 className="text-2xl font-bold mt-4 mb-2">Step 3: Generate Your Report</h3>
                <p>After gathering all the necessary information, our model generates a detailed report analyzing your health risks and making personalized recommendations.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}