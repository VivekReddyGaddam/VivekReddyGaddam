import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-purple-600">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full">
              <HomeIcon className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="#" className="text-purple-600 hover:text-purple-500">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;