import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import {
  SparklesIcon,
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BookOpenIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      name: 'AI-Powered Generation',
      description: 'Create dynamic, branching stories with advanced AI that adapts to user choices.',
      icon: CpuChipIcon,
    },
    {
      name: 'Multiple Domains',
      description: 'Support for gaming, education, therapy, and general storytelling domains.',
      icon: GlobeAltIcon,
    },
    {
      name: 'Real-time Adaptation',
      description: 'Stories adapt in real-time based on user emotions and preferences.',
      icon: SparklesIcon,
    },
    {
      name: 'Collaborative Creation',
      description: 'Work with others to create complex, multi-branch narratives.',
      icon: UserGroupIcon,
    },
  ];

  const stats = [
    { label: 'Stories Created', value: '10,000+' },
    { label: 'Active Users', value: '5,000+' },
    { label: 'Story Branches', value: '50,000+' },
    { label: 'Play Sessions', value: '100,000+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Powered Narrative Engine
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
              Create dynamic, interactive stories that adapt in real-time to user choices. 
              Perfect for gaming, education, therapy, and entertainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                      Create Story
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/library">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                      Explore Stories
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Storytelling
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides everything you need to create 
              engaging, interactive narratives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create interactive stories in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Your Story
              </h3>
              <p className="text-gray-600">
                Choose your genre, tone, and domain. Provide an initial prompt 
                and let our AI generate the first scene.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Add Branches
              </h3>
              <p className="text-gray-600">
                Create multiple story paths with different choices. Our AI ensures 
                consistency across all branches.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Share & Play
              </h3>
              <p className="text-gray-600">
                Publish your story and let others experience your interactive narrative. 
                Track engagement and iterate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Amazing Stories?
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of creators who are already using StoryForge AI 
            to build interactive narratives.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Start Creating Free
                </Button>
              </Link>
              <Link to="/library">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Browse Stories
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;