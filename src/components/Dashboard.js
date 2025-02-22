import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, FileText, Calendar, User } from 'lucide-react';

const data = [
  { name: "Jan", value: 30 },
  { name: "Feb", value: 40 },
  { name: "Mar", value: 35 },
  { name: "Apr", value: 50 },
  { name: "May", value: 49 },
  { name: "Jun", value: 60 },
  { name: "Jul", value: 70 },
  { name: "Aug", value: 91 },
  { name: "Sep", value: 125 },
];

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medical Risk Analyzer Dashboard</h1>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-500 cursor-pointer" />
          <div className="relative cursor-pointer">
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">3</span>
            <User className="text-gray-500" />
          </div>
          <span className="font-medium">Dr. Smith</span>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold">Patient Risk Assessment</h2>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-green-500 font-bold text-2xl">45%</h3>
            <p className="text-gray-500">Low Risk</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-red-500 font-bold text-2xl">15%</h3>
            <p className="text-gray-500">High Risk</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200} className="mt-4">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sidebar */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold">Recent Patients</h2>
          <div className="mt-2 flex items-center gap-2">
            <User className="text-gray-500" />
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-gray-500 text-sm">Last visit: Today</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-lg col-span-2">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="flex gap-4 mt-2">
            <Button variant="outline" className="flex items-center gap-2">
              <FileText /> Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar /> Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Questionnaire */}
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold">Patient Questionnaire</h2>
        <div className="mt-4">
          <label className="block text-sm font-medium">Medical History</label>
          <select className="mt-1 w-full p-2 border rounded-lg">
            <option>Select condition</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Current Symptoms</label>
          <textarea className="mt-1 w-full p-2 border rounded-lg h-24" />
        </div>
        <Button className="mt-4 w-full bg-blue-500 text-white">Submit Assessment</Button>
      </div>
    </div>
  );
}