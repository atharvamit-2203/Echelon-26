export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📈 Analytics</h1>
      <p className="text-secondary">Deep dive into bias patterns and trends</p>

      {/* Time Range */}
      <div className="flex gap-4">
        <select className="px-4 py-2 border rounded-lg">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last Quarter</option>
          <option>Last Year</option>
        </select>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">🔍 Top Finding</h3>
          <p className="text-blue-800">Age bias detected in 4 out of 8 keyword filters</p>
          <p className="text-sm text-blue-700 mt-2">Candidates over 45 are 30% more likely to be filtered out</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
          <h3 className="font-semibold text-green-900 mb-2">✨ Improvement</h3>
          <p className="text-green-800">Rescue rate increased by 15% this month</p>
          <p className="text-sm text-green-700 mt-2">127 qualified candidates recovered from rejection</p>
        </div>
      </div>

      {/* Trend Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Bias Trend Over Time</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">Trend chart would go here</p>
        </div>
      </div>

      {/* Keyword Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">🔤 Keyword Impact Analysis</h2>
        <div className="space-y-3">
          <KeywordRow keyword="KPI" usage={342} bias={0.42} />
          <KeywordRow keyword="OKR" usage={289} bias={0.38} />
          <KeywordRow keyword="Synergy" usage={156} bias={0.31} />
          <KeywordRow keyword="Leverage" usage={203} bias={0.28} />
          <KeywordRow keyword="Growth Hacking" usage={178} bias={0.25} />
        </div>
      </div>
    </div>
  )
}

function KeywordRow({ keyword, usage, bias }: { keyword: string; usage: number; bias: number }) {
  const biasPercent = (bias * 100).toFixed(0)
  const biasColor = bias > 0.35 ? 'text-red-600' : bias > 0.25 ? 'text-yellow-600' : 'text-green-600'
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
      <div className="flex-1">
        <span className="font-semibold">{keyword}</span>
        <span className="text-sm text-gray-600 ml-4">Usage: {usage}</span>
      </div>
      <div className={`font-semibold ${biasColor}`}>
        Bias: {biasPercent}%
      </div>
    </div>
  )
}
