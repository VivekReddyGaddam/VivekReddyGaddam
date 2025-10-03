import React, { useState, useEffect } from 'react';
import { useStoryStore } from '../../stores/storyStore';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const StoryTree = ({ storyId, onNodeSelect, onNodeEdit, onNodeDelete }) => {
  const { storyNodes, fetchStoryNodes, generateStoryNode, isLoading } = useStoryStore();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (storyId) {
      fetchStoryNodes(storyId);
    }
  }, [storyId, fetchStoryNodes]);

  const toggleNodeExpansion = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  const handleGenerateChild = async (parentNode) => {
    const prompt = `Continue the story from "${parentNode.text.substring(0, 100)}..."`;
    
    try {
      await generateStoryNode(storyId, {
        parentNodeId: parentNode.nodeId,
        prompt,
        choiceId: null
      });
      
      // Refresh the tree
      fetchStoryNodes(storyId);
    } catch (error) {
      console.error('Failed to generate child node:', error);
    }
  };

  const buildTreeStructure = (nodes) => {
    const nodeMap = new Map();
    const rootNodes = [];

    // Create node map
    nodes.forEach(node => {
      nodeMap.set(node.nodeId, { ...node, children: [] });
    });

    // Build tree structure
    nodes.forEach(node => {
      const nodeObj = nodeMap.get(node.nodeId);
      if (node.parentNodeId && nodeMap.has(node.parentNodeId)) {
        nodeMap.get(node.parentNodeId).children.push(nodeObj);
      } else {
        rootNodes.push(nodeObj);
      }
    });

    return rootNodes;
  };

  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.nodeId);
    const isSelected = selectedNode?.nodeId === node.nodeId;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.nodeId} className="select-none">
        <div
          className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-purple-50 border border-purple-200' : ''
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => handleNodeClick(node)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNodeExpansion(node.nodeId);
            }}
            className="mr-2 p-1 hover:bg-gray-200 rounded"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                node.isStartNode ? 'bg-green-500' :
                node.isEndNode ? 'bg-red-500' :
                'bg-blue-500'
              }`} />
              <span className="text-sm font-medium text-gray-900 truncate">
                {node.isStartNode ? 'Start' : 
                 node.isEndNode ? 'End' : 
                 `Node ${node.nodeId.split('_')[1]}`}
              </span>
              {node.choices && node.choices.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({node.choices.length} choices)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 truncate mt-1">
              {node.text.substring(0, 100)}...
            </p>
          </div>

          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateChild(node);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Generate child node"
            >
              <PlusIcon className="w-4 h-4 text-gray-500" />
            </button>
            
            {onNodeEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeEdit(node);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Edit node"
              >
                <PencilIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
            
            {onNodeDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeDelete(node);
                }}
                className="p-1 hover:bg-gray-200 rounded"
                title="Delete node"
              >
                <TrashIcon className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const treeStructure = buildTreeStructure(storyNodes);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Story Tree</h3>
        <p className="text-sm text-gray-600">
          {storyNodes.length} nodes • Click to expand/collapse branches
        </p>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {treeStructure.length === 0 ? (
          <div className="text-center py-8">
            <EyeIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No story nodes yet</p>
            <p className="text-xs text-gray-400">Generate your first story segment to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {treeStructure.map(node => renderNode(node))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryTree;