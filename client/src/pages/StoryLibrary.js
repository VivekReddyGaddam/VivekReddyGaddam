import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStoryStore } from '../stores/storyStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BookOpenIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const StoryLibrary = () => {
  const { 
    stories, 
    isLoading, 
    fetchPublicStories, 
    pagination 
  } = useStoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const genres = [
    { value: '', label: 'All Genres' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'horror', label: 'Horror' },
    { value: 'historical', label: 'Historical' },
    { value: 'adventure', label: 'Adventure' },
  ];

  const domains = [
    { value: '', label: 'All Domains' },
    { value: 'general', label: 'General' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'education', label: 'Education' },
    { value: 'therapy', label: 'Therapy' },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'length', label: 'Longest' },
  ];

  useEffect(() => {
    fetchPublicStories({
      page: currentPage,
      genre: selectedGenre,
      domain: selectedDomain,
      search: searchTerm,
      sort: sortBy,
    });
  }, [currentPage, selectedGenre, selectedDomain, searchTerm, sortBy, fetchPublicStories]);

  const getGenreColor = (genre) => {
    const colors = {
      fantasy: 'bg-purple-100 text-purple-800',
      'sci-fi': 'bg-blue-100 text-blue-800',
      mystery: 'bg-gray-100 text-gray-800',
      romance: 'bg-pink-100 text-pink-800',
      horror: 'bg-red-100 text-red-800',
      historical: 'bg-yellow-100 text-yellow-800',
      adventure: 'bg-green-100 text-green-800',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  const getDomainColor = (domain) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      gaming: 'bg-green-100 text-green-800',
      education: 'bg-blue-100 text-blue-800',
      therapy: 'bg-purple-100 text-purple-800',
    };
    return colors[domain] || 'bg-gray-100 text-gray-800';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPublicStories({
      page: 1,
      genre: selectedGenre,
      domain: selectedDomain,
      search: searchTerm,
      sort: sortBy,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Story Library</h1>
          <p className="mt-2 text-gray-600">
            Discover amazing interactive stories created by our community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Search & Filter</h2>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search stories by title, description, or tags..."
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    {genres.map(genre => (
                      <option key={genre.value} value={genre.value}>
                        {genre.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    {domains.map(domain => (
                      <option key={domain.value} value={domain.value}>
                        {domain.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <FunnelIcon className="w-5 h-5 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Stories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="xl" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or browse all stories.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stories.map((story) => (
                <div key={story._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {story.description || 'No description available'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenreColor(story.genre)}`}>
                        {story.genre}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDomainColor(story.domain)}`}>
                        {story.domain}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {story.stats?.playCount || 0}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {Math.round((story.stats?.averagePlayTime || 0) / 60)}m
                        </span>
                        <span className="flex items-center">
                          <BookOpenIcon className="w-4 h-4 mr-1" />
                          {story.stats?.totalNodes || 0}
                        </span>
                      </div>
                      <span className="flex items-center">
                        <StarIcon className="w-4 h-4 mr-1 text-yellow-400" />
                        4.5
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        by {story.userId?.username || 'Anonymous'}
                      </div>
                      <Link to={`/story/${story._id}`}>
                        <Button size="sm">
                          Play Story
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryLibrary;