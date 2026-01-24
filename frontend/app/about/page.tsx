export default function About() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ℹ️ About Fair-Hire Sentinel</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">What is Fair-Hire Sentinel?</h2>
            <p className="text-gray-700 mb-4">
              Fair-Hire Sentinel is an AI-powered monitoring dashboard designed to detect and eliminate hidden biases 
              in Applicant Tracking Systems (ATS). By analyzing historical selection rates across demographics like 
              age and gender, the system identifies rigid keyword filters that unfairly block experienced professionals.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">🎯 Our Mission</h3>
            <p className="text-gray-700 mb-4">
              To restore fairness and quality to the hiring process by ensuring that talented candidates aren't lost 
              due to outdated keyword filtering and unconscious bias in automated screening systems.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">🔍 How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>Monitor</strong> - Continuously analyze ATS screening patterns</li>
              <li><strong>Detect</strong> - Identify bias in keyword filters across demographics</li>
              <li><strong>Rescue</strong> - Use semantic embeddings to find hidden talent</li>
              <li><strong>Alert</strong> - Notify recruiters of potential bias and talent leakage</li>
              <li><strong>Recommend</strong> - Provide actionable steps to improve fairness</li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3">✨ Key Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Real-time bias detection across age, gender, and other demographics</li>
              <li>Semantic matching to identify equivalent terminology</li>
              <li>Automated candidate rescue from rejection pools</li>
              <li>Detailed analytics and trend analysis</li>
              <li>Actionable recommendations for recruiters</li>
            </ul>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Platform Stats</h3>
            <div className="space-y-3">
              <StatItem label="Candidates Analyzed" value="10,000+" />
              <StatItem label="Biases Detected" value="247" />
              <StatItem label="Candidates Rescued" value="1,340" />
              <StatItem label="Companies Using" value="45" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">🏆 Impact</h3>
            <div className="space-y-3">
              <StatItem label="Diversity Increase" value="+32%" />
              <StatItem label="Quality Hire Rate" value="+18%" />
              <StatItem label="Time Saved" value="500+ hours" />
            </div>
          </div>
        </div>
      </div>

      {/* Team & Contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-3">🤝 Our Team</h3>
        <p className="text-gray-700">
          Built by a team of AI engineers, HR professionals, and diversity advocates committed to creating 
          more equitable hiring processes.
        </p>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="font-bold text-lg">{value}</span>
    </div>
  )
}
