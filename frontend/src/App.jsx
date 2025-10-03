import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CreateStory from './pages/CreateStory'
import PlayStory from './pages/PlayStory'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/play/:storyId" element={<PlayStory />} />
      </Routes>
    </div>
  )
}

export default App