import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  PencilIcon,
  KeyIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    const result = await updateProfile(profileData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
    { id: 'settings', name: 'Settings', icon: PencilIcon },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account settings and view your statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="text-center">
                  <UserCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <nav className="space-y-1 p-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          } ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                            errors.lastName ? 'border-red-300' : 'border-gray-300'
                          } ${!isEditing ? 'bg-gray-50' : ''}`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                          errors.username ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>

                  {/* Change Password Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                      {!isChangingPassword ? (
                        <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                          <KeyIcon className="w-5 h-5 mr-2" />
                          Change Password
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleChangePassword}>
                            Update Password
                          </Button>
                        </div>
                      )}
                    </div>

                    {isChangingPassword && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                              errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                              errors.newPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'stats' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Your Statistics</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <BookOpenIcon className="w-8 h-8 text-purple-600 mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Stories Created</p>
                          <p className="text-2xl font-bold text-gray-900">{user?.stats?.storiesCreated || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="w-8 h-8 text-blue-600 mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Play Time</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round((user?.stats?.totalPlayTime || 0) / 60)} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Member since:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(user?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Last active:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(user?.stats?.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Subscription:</span>
                          <span className="ml-2 text-gray-900 capitalize">
                            {user?.subscription?.plan || 'Free'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Stories limit:</span>
                          <span className="ml-2 text-gray-900">
                            {user?.subscription?.features?.maxStories || 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Default Story Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Genre
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            defaultValue={user?.preferences?.defaultGenre || 'fantasy'}
                          >
                            <option value="fantasy">Fantasy</option>
                            <option value="sci-fi">Sci-Fi</option>
                            <option value="mystery">Mystery</option>
                            <option value="romance">Romance</option>
                            <option value="horror">Horror</option>
                            <option value="historical">Historical</option>
                            <option value="adventure">Adventure</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Default Tone
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            defaultValue={user?.preferences?.defaultTone || 'serious'}
                          >
                            <option value="serious">Serious</option>
                            <option value="humorous">Humorous</option>
                            <option value="mysterious">Mysterious</option>
                            <option value="romantic">Romantic</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={user?.preferences?.notifications?.email}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Email notifications
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked={user?.preferences?.notifications?.push}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Push notifications
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;