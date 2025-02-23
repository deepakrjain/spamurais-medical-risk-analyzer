import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import Navbar from './Navbar.js'; // Import Navbar component
import { db } from '../firebase.js'; // Assume you have set up Firebase correctly
import "../style.css";

// Function to fetch data from Firebase
const fetchRiskData = async () => {
  try {
    const snapshot = await db.collection('riskData').get(); // Assuming you store your risk data in a 'riskData' collection
    const data = snapshot.docs.map(doc => doc.data());
    return data;
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    return [];
  }
};

export default function Dashboard() {
  const [riskData, setRiskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRiskData = async () => {
      const data = await fetchRiskData();
      setRiskData(data);
      setIsLoading(false);
    };
    getRiskData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: false,
      },
    },
    xaxis: {
      categories: riskData.map(item => item.disease),
    },
    yaxis: {
      title: {
        text: 'Risk Percentage',
      },
    },
    colors: ['#2563eb'], // Blue color for the bars
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
  };

  const chartSeries = [
    {
      name: 'Risk Percentage',
      data: riskData.map(item => item.riskPercentage),
    },
  ];

  const handlePrintReport = () => {
    const reportContent = `
      Medical Risk Analyzer Report
      Date: ${new Date().toLocaleDateString()}
      Diseases and Risk Percentages:
      ${riskData.map(item => `${item.disease}: ${item.riskPercentage}%`).join('\n')}
    `;
    const printWindow = window.open();
    printWindow.document.write('<pre>' + reportContent + '</pre>');
    printWindow.print();
  };

  return (
    <div id="webcrumbs">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="dashboard-header mb-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center">Medical Risk Analyzer Dashboard</h1>
        </header>

        {/* Main Content */}
        <main className="dashboard-content space-y-6">
          {/* Risk Data Bar Chart */}
          <div className="card bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment by Disease</h2>
            {isLoading ? (
              <div className="loading-indicator text-center py-8 text-gray-500">Loading data...</div>
            ) : (
              <Chart
                type="bar"
                height={350}
                options={chartOptions}
                series={chartSeries}
              />
            )}
          </div>

          {/* Print Report Button */}
          <div className="card bg-white p-6 rounded-xl shadow-sm">
            <button
              onClick={handlePrintReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
            >
              Print Last Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}