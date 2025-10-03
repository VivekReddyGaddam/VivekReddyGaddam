import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export default function StoryGraph({ story, onSelectNode }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!story || !ref.current) return

    const width = 800
    const height = 500

    const nodes = (story.nodes || []).map(n => ({ id: n.id, label: (n.text || '').slice(0, 24) + '…' }))
    const idToIndex = new Map(nodes.map((n, i) => [n.id, i]))
    const links = []
    for (const n of story.nodes || []) {
      for (const c of n.choices || []) {
        if (c.to) links.push({ source: n.id, target: c.to })
      }
    }

    const svg = d3.select(ref.current)
    svg.selectAll('*').remove()

    svg.attr('viewBox', [0, 0, width, height]).attr('width', '100%')

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width/2, height/2))

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5)

    const node = svg.append('g')
      .attr('cursor', 'pointer')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 16)
      .attr('fill', d => d.id === story.rootNodeId ? '#2563eb' : '#64748b')
      .on('click', (_, d) => onSelectNode?.(d.id))
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null }))

    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .attr('dy', 28)
      .text(d => d.label)

    simulation.on('tick', () => {
      link.attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

      node.attr('cx', d => d.x).attr('cy', d => d.y)
      labels.attr('x', d => d.x).attr('y', d => d.y)
    })

    return () => simulation.stop()
  }, [story, onSelectNode])

  const nodesCount = (story?.nodes || []).length
  return <svg ref={ref} role="img" aria-label={`Story graph with ${nodesCount} nodes`} className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded" />
}
