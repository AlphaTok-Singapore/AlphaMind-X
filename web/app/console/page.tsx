export default function ConsoleHome() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Welcome to Dify
        </h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">Dify Console</h2>
            <p className="mb-4 text-gray-600">
              Build and manage your AI applications
            </p>
            <a
              href="/apps"
              className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Open Console
            </a>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">AlphaMind</h2>
            <p className="mb-4 text-gray-600">
              Advanced AI agent management and automation
            </p>
            <a
              href="/alphamind"
              className="inline-block rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Open AlphaMind
            </a>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold">n8n Workflows</h2>
            <p className="mb-4 text-gray-600">
              Automate workflows and integrations
            </p>
            <a
              href={process.env.NEXT_PUBLIC_N8N_URL ?? 'http://localhost:5678'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Open n8n
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
