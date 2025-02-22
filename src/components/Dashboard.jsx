import React from 'react';
import Chart from 'react-apexcharts';

export default function Dashboard() {
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
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125],
  }];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Medical Risk Analyzer Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <span className="material-symbols-outlined text-gray-600">notifications</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-600">person</span>
              <span className="font-medium text-gray-700">Dr. Smith</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-6">
            {/* Risk Assessment Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Patient Risk Assessment</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">trending_down</span>
                    <div>
                      <p className="text-sm text-gray-600">Low Risk</p>
                      <p className="text-2xl font-bold">45%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">trending_up</span>
                    <div>
                      <p className="text-sm text-gray-600">High Risk</p>
                      <p className="text-2xl font-bold">15%</p>
                    </div>
                  </div>
                </div>
              </div>
              <Chart
                type="area"
                height={300}
                options={chartOptions}
                series={chartSeries}
              />
            </div>

            {/* Questionnaire Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Patient Questionnaire</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="medical-history" className="block text-sm font-medium mb-2">
                    Medical History
                  </label>
                  <select
                    id="medical-history"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Select condition</option>
                    <option>Diabetes</option>
                    <option>Hypertension</option>
                    <option>Heart Disease</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-medium mb-2">
                    Current Symptoms
                  </label>
                  <textarea
                    id="symptoms"
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="4"
                  />
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Submit Assessment
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-6">
            {/* Recent Patients Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Recent Patients</h2>
              <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">person</span>
                </div>
                <div>
                  <h3 className="font-medium">John Doe</h3>
                  <p className="text-sm text-gray-500">Last visit: Today</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center">
                  <span className="material-symbols-outlined mb-2 text-blue-600">description</span>
                  <span className="text-sm">Export Report</span>
                </button>
                <button className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center">
                  <span className="material-symbols-outlined mb-2 text-blue-600">calendar_today</span>
                  <span className="text-sm">Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}