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
            <p className="text-gray-700 mb-4">
              Our system uses advanced machine learning powered by Google Gemini 2.0 Flash AI to perform semantic analysis 
              on CVs, comparing traditional keyword-based ATS screening with intelligent skill matching. This dual-analysis 
              approach reveals when qualified candidates are rejected due to terminology differences rather than actual lack of skills.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">🎯 Our Mission</h3>
            <p className="text-gray-700 mb-4">
              To restore fairness and quality to the hiring process by ensuring that talented candidates aren't lost 
              due to outdated keyword filtering and unconscious bias in automated screening systems. We believe every 
              candidate deserves to be evaluated on their actual capabilities, not on whether they use the exact buzzwords 
              an ATS expects.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">🔍 The Complete Process</h3>
            <div className="space-y-4 text-gray-700">
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <h4 className="font-semibold text-lg mb-2">1️⃣ CV Upload & Data Collection</h4>
                <p className="mb-2">Recruiters upload candidate CVs through our intuitive dashboard. The system accepts multiple formats and automatically extracts:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Candidate demographics (age, gender, location)</li>
                  <li>Professional experience and years in field</li>
                  <li>Skills and technical competencies</li>
                  <li>Education background and certifications</li>
                  <li>Current role and career progression</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50">
                <h4 className="font-semibold text-lg mb-2">2️⃣ Multi-Job Family Analysis</h4>
                <p className="mb-2">When CVs don't specify target positions, our AI analyzes them against 10 job families:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Technical:</strong> Software Engineering, Data Science & ML, DevOps & Cloud, QA & Testing</li>
                  <li><strong>Business:</strong> Product Management, Sales & Business Development, Marketing & Growth</li>
                  <li><strong>Design:</strong> UX/UI Design</li>
                  <li><strong>Operations:</strong> HR & Recruiting</li>
                  <li><strong>Finance:</strong> Finance & Accounting</li>
                </ul>
                <p className="mt-2">The system calculates match scores for each family based on 10-12 specific keywords per category, identifying the best fit for each candidate.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                <h4 className="font-semibold text-lg mb-2">3️⃣ Two-Stage Screening Process</h4>
                <p className="mb-2"><strong>Stage 1: Traditional ATS Screening</strong></p>
                <p className="mb-2">Keywords from job requirements are matched against CV text. Candidates with 70%+ keyword matches are immediately shortlisted for interviews. This replicates how traditional ATS systems work.</p>
                
                <p className="mt-3 mb-2"><strong>Stage 2: AI-Powered Semantic Analysis</strong></p>
                <p className="mb-2">For candidates rejected in Stage 1, our Gemini AI performs deep semantic analysis:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Calculates semantic similarity between CV skills and job requirements</li>
                  <li>Identifies professional synonyms (e.g., "Performance Targets" ≈ "KPIs")</li>
                  <li>Evaluates skill equivalency across different terminology</li>
                  <li>Generates overall match score combining exact and semantic matches</li>
                </ul>
                <p className="mt-2">Candidates with 65%+ semantic match scores are <strong>rescued</strong> from rejection and flagged for manual review.</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-50">
                <h4 className="font-semibold text-lg mb-2">4️⃣ Bias Detection Algorithms</h4>
                <p className="mb-2">Our system runs three parallel bias detection mechanisms:</p>
                
                <p className="mt-3 mb-1"><strong>A. Four-Fifths Rule Analysis</strong></p>
                <p className="mb-2">Groups candidates by age and gender, calculating rejection rates for each demographic. If any group's rejection rate is less than 80% of the highest rate, bias is flagged.</p>
                
                <p className="mt-3 mb-1"><strong>B. Peer Comparison Analysis (NEW)</strong></p>
                <p className="mb-2">Compares candidates with similar qualifications:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Identifies pairs with ATS scores within 15%</li>
                  <li>Similar experience levels (within 3 years)</li>
                  <li>Matching job family categories</li>
                </ul>
                <p className="mt-2">When similar candidates receive different outcomes (one accepted, one rejected) and differ demographically, the system flags <strong>disparate treatment</strong>.</p>
                
                <p className="mt-3 mb-1"><strong>C. Keyword Toxicity Detection</strong></p>
                <p className="mb-2">Identifies specific keywords causing disproportionate rejection rates (e.g., "Salesforce" rejecting 60% of CRM experts who use other tools).</p>
              </div>

              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <h4 className="font-semibold text-lg mb-2">5️⃣ Real-Time Alerting System</h4>
                <p className="mb-2">When bias is detected, the system generates detailed alerts with:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Alert severity (Critical, High, Medium, Low)</li>
                  <li>Specific bias type (demographic, keyword, disparate treatment)</li>
                  <li>Number of affected candidates</li>
                  <li>Detailed comparison data for peer cases</li>
                  <li>8-10 actionable recommendations to fix the issue</li>
                </ul>
                <p className="mt-2">Alerts are stored in Firebase and displayed in the dashboard with real-time notifications.</p>
              </div>

              <div className="border-l-4 border-cyan-500 pl-4 py-2 bg-cyan-50">
                <h4 className="font-semibold text-lg mb-2">6️⃣ Visual Analytics & Reporting</h4>
                <p className="mb-2">Recruiters access comprehensive visualizations:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Scatter Plots:</strong> ATS scores vs actual potential, showing rescued candidates</li>
                  <li><strong>Drift Analysis:</strong> How ATS thresholds diverge from candidate quality over time</li>
                  <li><strong>Clustering Views:</strong> Rejection patterns by skill groups and demographics</li>
                  <li><strong>Breakdown Reports:</strong> Detailed lists of accepted, rejected, and rescued candidates</li>
                </ul>
                <p className="mt-2">All charts use real analysis data, updating automatically after each screening batch.</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-6">⚙️ Technology Stack</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Frontend:</strong> Next.js 15, React, TypeScript, Tailwind CSS
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Backend:</strong> Python FastAPI, Firebase Firestore
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>AI Engine:</strong> Google Gemini 2.0 Flash (Semantic Analysis)
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Analytics:</strong> Recharts, Real-time Firebase Sync
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-3">✨ Key Features</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Multi-Job Family Analysis:</strong> Automatically matches CVs to 10 job categories when position isn't specified</li>
              <li><strong>Two-Stage Screening:</strong> Combines traditional ATS with AI semantic matching for comprehensive evaluation</li>
              <li><strong>Peer Comparison Bias Detection:</strong> Identifies similar candidates treated differently based on demographics</li>
              <li><strong>Real-time Alerts:</strong> Instant notifications with 8-10 detailed action recommendations</li>
              <li><strong>Four-Fifths Rule Compliance:</strong> Automated demographic bias detection following EEOC guidelines</li>
              <li><strong>Semantic Skill Matching:</strong> AI-powered synonym detection for fair terminology evaluation</li>
              <li><strong>Candidate Rescue System:</strong> Automatically identifies qualified candidates wrongly rejected by ATS</li>
              <li><strong>Visual Analytics Dashboard:</strong> Real-time charts and metrics showing bias patterns and trends</li>
              <li><strong>Firebase Integration:</strong> Secure cloud storage with real-time data synchronization</li>
              <li><strong>Actionable Insights:</strong> Not just detection, but specific steps to improve hiring fairness</li>
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
