export default function Navbar() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Fair-Hire Sentinel Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            🔔 Notifications
          </button>
          <button className="px-4 py-2 text-sm bg-primary text-white hover:bg-blue-700 rounded-lg transition">
            👤 Account
          </button>
        </div>
      </div>
    </header>
  )
}
