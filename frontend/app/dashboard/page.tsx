export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Monitoring Dashboard</h1>
      <p className="text-secondary">Real-time monitoring of ATS screening processes</p>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select className="px-4 py-2 border rounded-lg">
          <option>All Departments</option>
          <option>Sales</option>
          <option>Engineering</option>
          <option>Marketing</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>All Status</option>
          <option>Active</option>
          <option>Flagged</option>
          <option>Resolved</option>
        </select>
        <input type="date" className="px-4 py-2 border rounded-lg" />
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Candidates Screened Today</div>
          <div className="text-2xl font-bold">47</div>
          <div className="text-sm text-green-600">+12</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Bias Alerts</div>
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-red-600">-1</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Rescue Rate</div>
          <div className="text-2xl font-bold">8.5%</div>
          <div className="text-sm text-green-600">+2.3%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">System Health</div>
          <div className="text-2xl font-bold">98%</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem time="10:45 AM" event="Bias Alert" detail="Age bias detected in 'KPI' filter" />
          <ActivityItem time="10:32 AM" event="Candidate Rescued" detail="Sarah Chen (ID: 1847) rescued" />
          <ActivityItem time="10:15 AM" event="Screening Complete" detail="Batch #234 processed" />
          <ActivityItem time="9:58 AM" event="Bias Alert" detail="Gender bias in 'Leadership' keyword" />
        </div>
      </div>

      {/* Live Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📈 Live Screening Activity</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Chart visualization would go here</p>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ time, event, detail }: { time: string; event: string; detail: string }) {
  return (
    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded">
      <div className="text-sm text-gray-500 w-20">{time}</div>
      <div className="flex-1">
        <div className="font-semibold">{event}</div>
        <div className="text-sm text-gray-600">{detail}</div>
      </div>
    </div>
  )
}
