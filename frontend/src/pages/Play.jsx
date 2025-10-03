import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import StoryGraph from '../components/StoryGraph'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

function NodeView({ node, onChoose }) {
  return (
    <div className="border rounded p-4 bg-white dark:bg-gray-800">
      <p className="whitespace-pre-wrap">{node.text}</p>
      <div className="mt-4 grid gap-2">
        {node.choices.map((c, idx) => (
          <button key={idx} className="bg-slate-700 text-white px-3 py-2 rounded" onClick={() => onChoose(c.label)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Play() {
  const { storyId } = useParams()
  const [story, setStory] = useState(null)
  const [path, setPath] = useState([])
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [lore, setLore] = useState('')
  const [loreConflicts, setLoreConflicts] = useState([])

  const nodeById = useMemo(() => {
    const map = new Map()
    ;(story?.nodes || []).forEach(n => map.set(n.id, n))
    return map
  }, [story])

  const currentNode = useMemo(() => {
    if (!story) return null
    if (path.length === 0) return nodeById.get(story.rootNodeId)
    return nodeById.get(path[path.length - 1])
  }, [story, path, nodeById])

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/api/stories/${storyId}`)
      const data = await res.json()
      setStory(data)
    }
    load()
  }, [storyId])

  async function exportJson() {
    try {
      setExporting(true)
      const res = await fetch(`${API_BASE}/api/export/${storyId}`)
      const data = await res.json()
      const blob = new Blob([JSON.stringify({ story: data }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${story?.title || 'story'}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  async function choose(label) {
    if (!currentNode) return
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, parentNodeId: currentNode.id, choiceLabel: label, params: story.params })
      })
      if (!res.ok) throw new Error('Failed to branch')
      const data = await res.json()
      const res2 = await fetch(`${API_BASE}/api/stories/${storyId}`)
      const updated = await res2.json()
      setStory(updated)
      setPath(p => [...p, data.childNodeId])
    } catch (e) {
      setError(e.message)
    }
  }

  async function uploadLore(e) {
    e.preventDefault()
    if (!lore.trim()) return
    await fetch(`${API_BASE}/api/lore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, markdown: lore })
    })
  }

  async function checkLore() {
    const res = await fetch(`${API_BASE}/api/lore/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, text: (story?.nodes || []).map(n=>n.text).join('\n') })
    })
    const data = await res.json()
    setLoreConflicts(data.conflicts || [])
  }

  if (!story || !currentNode) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{story.title}</h1>
        <button onClick={exportJson} disabled={exporting} className="bg-emerald-600 text-white px-3 py-2 rounded disabled:opacity-50">Export JSON</button>
      </div>
      {error && <div className="text-red-600" role="alert">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NodeView node={currentNode} onChoose={choose} />
        <div>
          <StoryGraph story={story} onSelectNode={(id) => setPath(p => [...p, id])} />
          <div className="mt-4 space-y-2">
            <form onSubmit={uploadLore} className="space-y-2">
              <label className="block text-sm font-medium">Lore (Markdown)</label>
              <textarea className="w-full border rounded p-2" rows={6} value={lore} onChange={(e)=>setLore(e.target.value)} placeholder="- Character: Elara (alive)" />
              <div className="flex gap-2">
                <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded">Upload Lore</button>
                <button type="button" onClick={checkLore} className="bg-slate-600 text-white px-3 py-2 rounded">Check Consistency</button>
              </div>
            </form>
            {loreConflicts.length > 0 && (
              <div className="text-yellow-700">
                <p className="font-semibold">Conflicts:</p>
                <ul className="list-disc ml-6">
                  {loreConflicts.map((c, i) => (
                    <li key={i}>{c.type} for {c.name}: expected {c.expected}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
