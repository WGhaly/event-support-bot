import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ID Card Automation Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Generate professional ID cards in bulk. Upload your design, add data, and create badges for your entire team in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Design Templates</h3>
            <p className="text-sm text-gray-600">Upload your badge design and place fields visually</p>
          </div>
          <div className="text-center p-6 bg-indigo-50 rounded-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Import Data</h3>
            <p className="text-sm text-gray-600">Upload CSV or Excel with attendee information</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate & Export</h3>
            <p className="text-sm text-gray-600">Create badges in bulk and download as ZIP</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition text-center"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>✓ No credit card required  •  ✓ Free for up to 100 badges  •  ✓ Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
