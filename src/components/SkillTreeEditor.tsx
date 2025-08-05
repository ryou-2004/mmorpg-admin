'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Move, ZoomIn, ZoomOut } from 'lucide-react'

interface SkillNode {
  id: number
  name: string
  description: string
  node_type: string
  node_type_name: string
  points_required: number
  effects: any
  position_x: number
  position_y: number
  active: boolean
}

interface SkillTreeEditorProps {
  skillNodes: SkillNode[]
  skillLineId: string
  onNodeClick?: (node: SkillNode) => void
  onNodeEdit?: (node: SkillNode) => void
  onNodeDelete?: (node: SkillNode) => void
  onAddNode?: (x: number, y: number) => void
  onNodeMove?: (nodeId: number, x: number, y: number) => void
  editable?: boolean
}

export default function SkillTreeEditor({
  skillNodes,
  skillLineId,
  onNodeClick,
  onNodeEdit,
  onNodeDelete,
  onAddNode,
  onNodeMove,
  editable = true
}: SkillTreeEditorProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [draggedNode, setDraggedNode] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const GRID_SIZE = 80
  const NODE_SIZE = 60

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'stat_boost':
        return 'bg-green-500 hover:bg-green-600 border-green-300'
      case 'technique':
        return 'bg-purple-500 hover:bg-purple-600 border-purple-300'
      case 'passive':
        return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-300'
      default:
        return 'bg-gray-500 hover:bg-gray-600 border-gray-300'
    }
  }

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) { // Right click for panning
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    }
  }

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ 
        x: e.clientX - dragStart.x, 
        y: e.clientY - dragStart.y 
      })
    }
  }

  const handleContainerMouseUp = () => {
    setIsDragging(false)
  }

  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    if (!editable || !onAddNode) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = Math.round(((e.clientX - rect.left - pan.x) / zoom) / GRID_SIZE)
    const y = Math.round(((e.clientY - rect.top - pan.y) / zoom) / GRID_SIZE)
    
    onAddNode(x, y)
  }

  const handleNodeClick = (e: React.MouseEvent, node: SkillNode) => {
    e.stopPropagation()
    setSelectedNode(node.id)
    onNodeClick?.(node)
  }

  const zoomIn = () => setZoom(Math.min(zoom * 1.2, 3))
  const zoomOut = () => setZoom(Math.max(zoom / 1.2, 0.3))
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Calculate bounds for proper grid rendering
  const bounds = skillNodes.reduce(
    (acc, node) => ({
      minX: Math.min(acc.minX, node.position_x),
      maxX: Math.max(acc.maxX, node.position_x),
      minY: Math.min(acc.minY, node.position_y),
      maxY: Math.max(acc.maxY, node.position_y)
    }),
    { minX: -2, maxX: 10, minY: -2, maxY: 10 }
  )

  const gridLines = []
  for (let x = bounds.minX - 2; x <= bounds.maxX + 2; x++) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x * GRID_SIZE}
        y1={(bounds.minY - 2) * GRID_SIZE}
        x2={x * GRID_SIZE}
        y2={(bounds.maxY + 2) * GRID_SIZE}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    )
  }
  for (let y = bounds.minY - 2; y <= bounds.maxY + 2; y++) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={(bounds.minX - 2) * GRID_SIZE}
        y1={y * GRID_SIZE}
        x2={(bounds.maxX + 2) * GRID_SIZE}
        y2={y * GRID_SIZE}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={resetView}>
            リセット
          </Button>
        </div>
        {editable && (
          <div className="text-sm text-gray-600">
            ダブルクリック: ノード追加 | 右クリック+ドラッグ: 画面移動 | ノードドラッグ: 移動
          </div>
        )}
      </div>

      {/* Skill Tree Canvas */}
      <Card className="overflow-hidden bg-gray-50">
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative w-full h-[600px] cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleContainerMouseDown}
            onMouseMove={handleContainerMouseMove}
            onMouseUp={handleContainerMouseUp}
            onDoubleClick={handleContainerDoubleClick}
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              {/* Grid */}
              <g opacity="0.3">
                {gridLines}
              </g>

              {/* Connection lines between nodes */}
              <g stroke="#94a3b8" strokeWidth="2" fill="none">
                {skillNodes.map(node => {
                  // Find nodes that could be connected (basic example)
                  const connections = skillNodes.filter(other => 
                    other.id !== node.id && 
                    Math.abs(other.position_x - node.position_x) <= 1 &&
                    Math.abs(other.position_y - node.position_y) <= 1 &&
                    other.position_y === node.position_y + 1 // Connect to nodes below
                  )
                  
                  return connections.map(connected => (
                    <line
                      key={`${node.id}-${connected.id}`}
                      x1={node.position_x * GRID_SIZE + NODE_SIZE / 2}
                      y1={node.position_y * GRID_SIZE + NODE_SIZE / 2}
                      x2={connected.position_x * GRID_SIZE + NODE_SIZE / 2}
                      y2={connected.position_y * GRID_SIZE + NODE_SIZE / 2}
                      opacity="0.6"
                    />
                  ))
                })}
              </g>
            </svg>

            {/* Skill Nodes */}
            {skillNodes.map(node => (
              <div
                key={node.id}
                className={`absolute flex flex-col items-center justify-center rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer select-none ${
                  getNodeTypeColor(node.node_type)
                } ${
                  selectedNode === node.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                } ${
                  !node.active ? 'opacity-50' : ''
                }`}
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  left: node.position_x * GRID_SIZE + pan.x,
                  top: node.position_y * GRID_SIZE + pan.y,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center',
                  zIndex: selectedNode === node.id ? 10 : 5
                }}
                onClick={(e) => handleNodeClick(e, node)}
              >
                <div className="text-xs font-bold text-white text-center px-1 leading-tight">
                  {node.name}
                </div>
                <div className="text-xs text-white opacity-80">
                  SP: {node.points_required}
                </div>
                
                {/* Node actions */}
                {editable && selectedNode === node.id && (
                  <div className="absolute -top-8 left-0 flex space-x-1 bg-white rounded shadow-lg p-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onNodeEdit?.(node)
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                      onClick={(e) => {
                        e.stopPropagation()
                        onNodeDelete?.(node)
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Node Indicator */}
            {editable && (
              <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Plus className="w-4 h-4" />
                  <span>ダブルクリックでノード追加</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Node Type Legend */}
      <div className="flex items-center space-x-4 text-sm">
        <span className="font-medium">ノードタイプ:</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded border"></div>
          <span>ステータス上昇</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-purple-500 rounded border"></div>
          <span>技・特技</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
          <span>パッシブ効果</span>
        </div>
      </div>
    </div>
  )
}