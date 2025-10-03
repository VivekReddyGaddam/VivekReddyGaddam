import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Cog6ToothIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Manage your account information and preferences.
              </p>
              <Link to="/profile">
                <Button variant="outline" className="w-full">
                  Go to Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <BellIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Configure how you receive notifications.
              </p>
              <Button variant="outline" className="w-full">
                Notification Settings
              </Button>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Privacy & Security</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Control your privacy settings and data.
              </p>
              <Button variant="outline" className="w-full">
                Privacy Settings
              </Button>
            </div>
          </div>

          {/* Billing */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <CreditCardIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Billing & Subscription</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Manage your subscription and billing information.
              </p>
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <UserGroupIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Team Management</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Collaborate with team members on stories.
              </p>
              <Button variant="outline" className="w-full">
                Team Settings
              </Button>
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Cog6ToothIcon className="w-6 h-6 text-gray-400 mr-3" />
                <h2 className="text-lg font-medium text-gray-900">Advanced Settings</h2>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Advanced configuration options.
              </p>
              <Button variant="outline" className="w-full">
                Advanced Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;