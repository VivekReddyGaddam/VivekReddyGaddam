import React, { useState } from 'react';
import Button from '../common/Button';
import {
  HeartIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const TherapyMode = ({ storyData, onUpdate }) => {
  const [emotionalState, setEmotionalState] = useState({
    anxiety: 3,
    depression: 2,
    stress: 4,
    mood: 6,
    confidence: 5,
    overall: 5
  });

  const [copingStrategies, setCopingStrategies] = useState([
    { id: 1, name: 'Deep Breathing', description: 'Take slow, deep breaths to calm your nervous system', used: false },
    { id: 2, name: 'Positive Self-Talk', description: 'Replace negative thoughts with positive affirmations', used: false },
    { id: 3, name: 'Mindfulness', description: 'Focus on the present moment without judgment', used: false },
    { id: 4, name: 'Progressive Relaxation', description: 'Tense and relax different muscle groups', used: false }
  ]);

  const [progress, setProgress] = useState({
    sessionsCompleted: 1,
    totalTime: 15,
    goals: [
      { id: 1, text: 'Reduce anxiety levels', target: 2, current: 3, achieved: false },
      { id: 2, text: 'Improve mood stability', target: 7, current: 6, achieved: false },
      { id: 3, text: 'Build coping skills', target: 3, current: 2, achieved: false }
    ],
    insights: []
  });

  const [triggers, setTriggers] = useState([
    { id: 1, trigger: 'Conflict situations', severity: 'medium', coping: 'Deep breathing' },
    { id: 2, trigger: 'Social pressure', severity: 'high', coping: 'Positive self-talk' },
    { id: 3, trigger: 'Uncertainty', severity: 'medium', coping: 'Mindfulness' }
  ]);

  const [journal, setJournal] = useState([
    {
      id: 1,
      date: new Date().toISOString(),
      entry: 'Started the story today. Feeling a bit anxious about the choices ahead.',
      emotions: ['anxiety', 'curiosity'],
      copingUsed: ['Deep Breathing']
    }
  ]);

  const handleEmotionalChange = (emotion, value) => {
    setEmotionalState(prev => ({
      ...prev,
      [emotion]: Math.max(1, Math.min(10, value))
    }));
  };

  const useCopingStrategy = (strategyId) => {
    setCopingStrategies(prev => 
      prev.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, used: true }
          : strategy
      )
    );

    // Apply coping strategy effects
    const strategy = copingStrategies.find(s => s.id === strategyId);
    if (strategy) {
      // Simulate positive effects
      setEmotionalState(prev => ({
        ...prev,
        anxiety: Math.max(1, prev.anxiety - 1),
        stress: Math.max(1, prev.stress - 1),
        mood: Math.min(10, prev.mood + 1)
      }));
    }
  };

  const addJournalEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      entry: entry,
      emotions: ['neutral'],
      copingUsed: []
    };
    
    setJournal(prev => [newEntry, ...prev]);
  };

  const getEmotionalColor = (value) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 6) return 'text-yellow-600';
    if (value >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEmotionalBg = (value) => {
    if (value >= 8) return 'bg-green-100';
    if (value >= 6) return 'bg-yellow-100';
    if (value >= 4) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Emotional State */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
          Current Emotional State
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(emotionalState).map(([emotion, value]) => (
            <div key={emotion} className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2 capitalize">
                {emotion.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className={`text-2xl font-bold ${getEmotionalColor(value)}`}>
                {value}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getEmotionalBg(value)} ${getEmotionalColor(value)}`}>
                {value >= 8 ? 'Excellent' : 
                 value >= 6 ? 'Good' : 
                 value >= 4 ? 'Fair' : 'Needs Attention'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coping Strategies */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
          Coping Strategies
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {copingStrategies.map(strategy => (
            <div key={strategy.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                {strategy.used && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    Used Today
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
              <Button 
                size="sm" 
                onClick={() => useCopingStrategy(strategy.id)}
                disabled={strategy.used}
                className="w-full"
              >
                {strategy.used ? 'Already Used' : 'Use Strategy'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
          Therapy Goals
        </h3>
        
        <div className="space-y-4">
          {progress.goals.map(goal => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{goal.text}</h4>
                <span className="text-sm text-gray-600">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.current >= goal.target ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                ></div>
              </div>
              {goal.current >= goal.target && (
                <div className="text-sm text-green-600">✓ Goal achieved!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trigger Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
          Trigger Management
        </h3>
        
        <div className="space-y-3">
          {triggers.map(trigger => (
            <div key={trigger.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{trigger.trigger}</h4>
                <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(trigger.severity)}`}>
                  {trigger.severity} severity
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Coping strategy: <span className="font-medium">{trigger.coping}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Journal */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Therapy Journal</h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
          {journal.map(entry => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
                <div className="flex space-x-1">
                  {entry.emotions.map(emotion => (
                    <span key={emotion} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700">{entry.entry}</p>
              {entry.copingUsed.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Coping used: </span>
                  {entry.copingUsed.map(coping => (
                    <span key={coping} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mr-1">
                      {coping}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div>
          <textarea
            placeholder="How are you feeling today? What thoughts or emotions came up during the story?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey && e.target.value.trim()) {
                addJournalEntry(e.target.value.trim());
                e.target.value = '';
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Press Ctrl+Enter to save entry</p>
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-purple-600" />
          Session Information
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progress.sessionsCompleted}
            </div>
            <div className="text-sm text-gray-600">Sessions Completed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progress.totalTime}m
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      </div>

      {/* Therapy Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Therapy Tools</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleEmotionalChange('anxiety', emotionalState.anxiety - 1)}
          >
            Reduce Anxiety
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleEmotionalChange('mood', emotionalState.mood + 1)}
          >
            Improve Mood
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setProgress(prev => ({ ...prev, totalTime: prev.totalTime + 5 }))}
          >
            +5 Min Session
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              const insight = `Insight gained: ${new Date().toLocaleTimeString()}`;
              setProgress(prev => ({ 
                ...prev, 
                insights: [...prev.insights, insight] 
              }));
            }}
          >
            Add Insight
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapyMode;