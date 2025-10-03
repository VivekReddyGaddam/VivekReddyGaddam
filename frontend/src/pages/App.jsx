import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">StoryForge AI</h1>
        <nav className="space-x-4">
          <Link className="underline" to="/create">Create</Link>
        </nav>
      </header>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="mt-2">Create interactive, branching stories with AI. Start by creating a new story.</p>
        <Link className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded" to="/create">New Story</Link>
      </section>
    </div>
  )
}
