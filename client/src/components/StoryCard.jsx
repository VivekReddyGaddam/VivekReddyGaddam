import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

const StoryCard = ({ story, onDelete, onExport }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const genreColors = {
    fantasy: 'bg-purple-100 text-purple-800',
    'sci-fi': 'bg-blue-100 text-blue-800',
    historical: 'bg-amber-100 text-amber-800',
    mystery: 'bg-gray-100 text-gray-800',
    horror: 'bg-red-100 text-red-800',
    romance: 'bg-pink-100 text-pink-800',
    cyberpunk: 'bg-cyan-100 text-cyan-800'
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 fade-in">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${genreColors[story.parameters.genre]}`}>
              {story.parameters.genre}
            </span>
            <span className="text-sm text-gray-500">
              {story.parameters.tone}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {story.initialPrompt}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>{story.nodes.length} nodes</span>
        <span>{formatDate(story.updatedAt)}</span>
      </div>

      <div className="flex items-center space-x-2">
        <Link 
          to={`/play/${story._id}`}
          className="flex-1 btn-primary flex items-center justify-center space-x-2"
        >
          <FaPlay />
          <span>Play</span>
        </Link>
        <Link
          to={`/edit/${story._id}`}
          className="btn-secondary"
          aria-label="Edit story"
        >
          <FaEdit />
        </Link>
        {onExport && (
          <button
            onClick={() => onExport(story._id)}
            className="btn-secondary"
            aria-label="Export story"
          >
            <FaDownload />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(story._id)}
            className="btn-danger"
            aria-label="Delete story"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryCard;
