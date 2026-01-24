export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-2">Fair-Hire Sentinel</h1>
        <p className="text-lg text-secondary">Real-time AI-powered bias detection & talent rescue system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Candidates" value="250" delta="+12" />
        <MetricCard title="ATS Rejections" value="88" delta="35%" trend="down" />
        <MetricCard title="Rescued Candidates" value="12" delta="+5" />
        <MetricCard title="Active Bias Alerts" value="3" delta="⚠️" />
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">⚠️ Real-time Alerts</h2>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <h3 className="font-semibold text-yellow-800">🟡 Bias Detected in Keyword Filters</h3>
          <p className="text-yellow-700 mt-2">
            <strong>3</strong> keyword(s) show rejection rate disparities exceeding 25% threshold.
          </p>
          <p className="text-yellow-700"><strong>Most Affected:</strong> Candidates over 45 years old</p>
          <p className="text-sm text-yellow-600 mt-2">💡 Recommendation: Review "KPI" and "OKR" filters to include semantic equivalents</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="font-semibold text-blue-800">🦸 Talent Rescue Opportunity</h3>
          <p className="text-blue-700 mt-2">
            <strong>12</strong> high-potential candidates auto-rejected but have &gt;85% semantic match.
          </p>
          <p className="text-blue-700"><strong>Demographics:</strong> Primarily experienced professionals (45+) and female candidates</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">📊 Age Group Analysis</h3>
          <div className="space-y-3">
            <StatBar label="Under 30" value={22} color="bg-blue-500" />
            <StatBar label="30-45" value={30} color="bg-green-500" />
            <StatBar label="Over 45" value={52} color="bg-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">📊 Gender Analysis</h3>
          <div className="space-y-3">
            <StatBar label="Male" value={28} color="bg-green-500" />
            <StatBar label="Female" value={42} color="bg-purple-500" />
            <StatBar label="Non-binary" value={38} color="bg-orange-500" />
          </div>
        </div>
      </div>

      {/* Rescued Candidates */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">🦸 Rescued High-Potential Candidates</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keywords</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">1023</td>
                <td className="px-6 py-4 whitespace-nowrap">&gt;45</td>
                <td className="px-6 py-4 whitespace-nowrap">Female</td>
                <td className="px-6 py-4 whitespace-nowrap">CRM Strategy</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">92%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">1847</td>
                <td className="px-6 py-4 whitespace-nowrap">&gt;45</td>
                <td className="px-6 py-4 whitespace-nowrap">Male</td>
                <td className="px-6 py-4 whitespace-nowrap">KPI</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">89%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">2156</td>
                <td className="px-6 py-4 whitespace-nowrap">30-45</td>
                <td className="px-6 py-4 whitespace-nowrap">Female</td>
                <td className="px-6 py-4 whitespace-nowrap">Client Engagement</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">87%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">✅ Immediate Actions</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Expand "KPI" filter to include: "Metrics", "Performance Indicators"</li>
            <li>✓ Review 12 rescued candidates with &gt;85% semantic match</li>
            <li>✓ Adjust age-sensitive keyword filters</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3">🔧 System Improvements</h3>
          <ul className="space-y-2 text-sm">
            <li>• Enable semantic matching for all keyword filters</li>
            <li>• Add experience-weight balancing</li>
            <li>• Schedule bias audit for next quarter</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, delta, trend }: { title: string; value: string; delta: string; trend?: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg shadow-lg p-6">
      <h3 className="text-sm opacity-90 mb-2">{title}</h3>
      <div className="text-3xl font-bold">{value}</div>
      <div className={`text-sm mt-2 ${trend === 'down' ? 'text-red-200' : 'text-green-200'}`}>{delta}</div>
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}
