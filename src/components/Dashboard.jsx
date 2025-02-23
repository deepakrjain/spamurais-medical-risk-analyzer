import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import Navbar from './Navbar'; // Import Navbar component
import "../style.css";
export default function Dashboard() {
  const [stats, setStats] = useState({
    lowRisk: 0,
    highRisk: 0,
    riskData: [],
  });

  useEffect(() => {
    // Simulated API call to fetch dashboard stats from your model
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/dashboard-stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setStats({
          lowRisk: data.lowRisk || 45, // Default to 45% if not provided
          highRisk: data.highRisk || 15, // Default to 15% if not provided
          riskData: data.riskData || [30, 40, 35, 50, 49, 60, 70, 91, 125], // Default chart data
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        alert('Error loading dashboard data');
      }
    };

    fetchDashboardStats();
  }, []);

  const chartOptions = {
    chart: {
      toolbar: { show: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    colors: ['#2563eb'],
  };

  const chartSeries = [{
    name: 'Risk Score',
    data: stats.riskData,
  }];

  return (
    <div className="dashboard-container min-h-screen bg-gray-50 p-6">
      <Navbar /> {/* Include Navbar here */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="dashboard-header flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Medical Risk Analyzer Dashboard</h1>
          <div className="header-actions flex items-center gap-4">
            <div className="notification relative cursor-pointer">
              <span className="material-symbols-outlined text-gray-600">notifications</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </div>
            <div className="user-info flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-600">person</span>
              <span className="font-medium text-gray-700">Dr. Smith</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-grid grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Risk Assessment Card */}
            <div className="card bg-white p-6 rounded-xl shadow-sm">
              <h2 className="card-title text-xl font-semibold mb-4">Patient Risk Assessment</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="risk-card low bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined icon text-green-600">trending_down</span>
                    <div className="content">
                      <p className="text-sm text-gray-600">Low Risk</p>
                      <p className="value text-2xl font-bold">{stats.lowRisk}%</p>
                    </div>
                  </div>
                </div>
                <div className="risk-card high bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined icon text-red-600">trending_up</span>
                    <div className="content">
                      <p className="text-sm text-gray-600">High Risk</p>
                      <p className="value text-2xl font-bold">{stats.highRisk}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <Chart
                  type="area"
                  height={300}
                  options={chartOptions}
                  series={chartSeries}
                />
              </div>
            </div>

            {/* Questionnaire Card */}
            <div className="card questionnaire-card bg-white p-6 rounded-xl shadow-sm">
              <h2 className="card-title text-xl font-semibold mb-4">Patient Questionnaire</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="medical-history" className="block text-sm font-medium text-gray-700 mb-2">
                    Medical History
                  </label>
                  <select
                    id="medical-history"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Select condition</option>
                    <option>Diabetes</option>
                    <option>Hypertension</option>
                    <option>Heart Disease</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Submit Assessment
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Patients Card */}
            <div className="card recent-patients-card bg-white p-6 rounded-xl shadow-sm">
              <h2 className="card-title text-xl font-semibold mb-4">Recent Patients</h2>
              <div className="recent-patient flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="avatar w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">person</span>
                </div>
                <div className="details">
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-gray-500">Last visit: Today</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card quick-actions-card bg-white p-6 rounded-xl shadow-sm">
              <h2 className="card-title text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="quick-action-button p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center">
                  <span className="material-symbols-outlined text-blue-600">description</span>
                  <span className="label text-sm">Export Report</span>
                </button>
                <button className="quick-action-button p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center">
                  <span className="material-symbols-outlined text-blue-600">calendar_today</span>
                  <span className="label text-sm">Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}