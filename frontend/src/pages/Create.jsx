import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

export default function Create() {
  const [prompt, setPrompt] = useState('A cyberpunk detective story about loss')
  const [title, setTitle] = useState('Untitled Story')
  const [genre, setGenre] = useState('sci-fi')
  const [tone, setTone] = useState('serious')
  const [length, setLength] = useState('short')
  const [sentiment, setSentiment] = useState(0)
  const [importing, setImporting] = useState(false)
  const navigate = useNavigate()

  async function createStory(e) {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, prompt, params: { genre, tone, length, sentiment: Number(sentiment) } }),
    })
    if (!res.ok) {
      alert('Failed to create story')
      return
    }
    const data = await res.json()
    navigate(`/play/${data.storyId}`)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Story</h1>
      <form className="space-y-4" onSubmit={createStory}>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="mt-1 w-full border rounded p-2" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Prompt</label>
          <textarea className="mt-1 w-full border rounded p-2" rows={4} value={prompt} onChange={e=>setPrompt(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Genre</label>
            <select className="mt-1 w-full border rounded p-2" value={genre} onChange={e=>setGenre(e.target.value)}>
              <option>fantasy</option>
              <option>sci-fi</option>
              <option>historical</option>
              <option>general</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Tone</label>
            <select className="mt-1 w-full border rounded p-2" value={tone} onChange={e=>setTone(e.target.value)}>
              <option>serious</option>
              <option>humorous</option>
              <option>balanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Length</label>
            <select className="mt-1 w-full border rounded p-2" value={length} onChange={e=>setLength(e.target.value)}>
              <option>short</option>
              <option>medium</option>
              <option>long</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Sentiment</label>
            <input type="range" min="-1" max="1" step="0.1" value={sentiment} onChange={e=>setSentiment(e.target.value)} className="mt-1 w-full" />
            <div className="text-xs">{sentiment}</div>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Generate</button>
      </form>

      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold">Import Story JSON</h2>
        <p className="text-sm text-gray-600">Import a previously exported story.</p>
        <label className="inline-block mt-2 bg-slate-700 text-white px-3 py-2 rounded cursor-pointer">
          <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setImporting(true)
            const text = await file.text()
            const payload = JSON.parse(text)
            const res = await fetch(`${API_BASE}/api/import`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
            const data = await res.json()
            setImporting(false)
            if (data.storyId) {
              navigate(`/play/${data.storyId}`)
            }
          }} />
          {importing ? 'Importing…' : 'Choose JSON file'}
        </label>
      </div>
    </div>
  )
}
