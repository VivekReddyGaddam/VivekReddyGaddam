import React, { useState } from 'react';
import Button from '../common/Button';
import {
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  StarIcon,
  TrophyIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const GamingMode = ({ storyData, onUpdate }) => {
  const [characterStats, setCharacterStats] = useState({
    health: 100,
    mana: 50,
    experience: 0,
    level: 1,
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    charisma: 10
  });

  const [inventory, setInventory] = useState([
    { id: 1, name: 'Basic Sword', type: 'weapon', damage: 10 },
    { id: 2, name: 'Health Potion', type: 'consumable', effect: 'heal', value: 25 },
    { id: 3, name: 'Magic Scroll', type: 'spell', manaCost: 15, effect: 'fireball' }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Steps', description: 'Complete your first story segment', unlocked: true },
    { id: 2, name: 'Explorer', description: 'Make 10 different choices', unlocked: false },
    { id: 3, name: 'Survivor', description: 'Complete a story without dying', unlocked: false }
  ]);

  const [quests, setQuests] = useState([
    { id: 1, title: 'Find the Lost Artifact', description: 'Locate the ancient artifact hidden in the forest', status: 'active', reward: '500 XP' },
    { id: 2, title: 'Defeat the Dragon', description: 'Face the fearsome dragon in its lair', status: 'available', reward: '1000 XP + Dragon Scale' }
  ]);

  const handleStatChange = (stat, value) => {
    setCharacterStats(prev => ({
      ...prev,
      [stat]: Math.max(0, Math.min(100, prev[stat] + value))
    }));
  };

  const handleInventoryAction = (item, action) => {
    if (action === 'use' && item.type === 'consumable') {
      if (item.effect === 'heal') {
        setCharacterStats(prev => ({
          ...prev,
          health: Math.min(100, prev.health + item.value)
        }));
      }
      
      // Remove item from inventory
      setInventory(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const unlockAchievement = (achievementId) => {
    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, unlocked: true }
          : achievement
      )
    );
  };

  const updateQuestStatus = (questId, status) => {
    setQuests(prev => 
      prev.map(quest => 
        quest.id === questId 
          ? { ...quest, status }
          : quest
      )
    );
  };

  const getStatColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    if (value >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Character Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
          Character Stats
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <HeartIcon className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm font-medium">Health</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(characterStats.health)}`}>
              {characterStats.health}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${characterStats.health}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BoltIcon className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">Mana</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(characterStats.mana)}`}>
              {characterStats.mana}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${characterStats.mana}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">XP</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {characterStats.experience}
            </div>
            <div className="text-xs text-gray-500">Level {characterStats.level}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CogIcon className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm font-medium">Strength</span>
            </div>
            <div className="text-2xl font-bold text-gray-700">
              {characterStats.strength}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inventory.map(item => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {item.type}
                </span>
              </div>
              
              {item.damage && (
                <p className="text-sm text-gray-600 mb-2">Damage: {item.damage}</p>
              )}
              
              {item.effect && (
                <p className="text-sm text-gray-600 mb-2">Effect: {item.effect}</p>
              )}
              
              {item.type === 'consumable' && (
                <Button 
                  size="sm" 
                  onClick={() => handleInventoryAction(item, 'use')}
                  className="w-full"
                >
                  Use
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Active Quests</h3>
        
        <div className="space-y-3">
          {quests.filter(quest => quest.status === 'active').map(quest => (
            <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{quest.title}</h4>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
              <p className="text-xs text-gray-500">Reward: {quest.reward}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrophyIcon className="w-5 h-5 mr-2 text-yellow-600" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`border rounded-lg p-4 ${
                achievement.unlocked 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                {achievement.unlocked && (
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Game Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Game Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleStatChange('health', -10)}
            disabled={characterStats.health <= 0}
          >
            Take Damage
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleStatChange('health', 20)}
            disabled={characterStats.health >= 100}
          >
            Heal
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleStatChange('mana', -10)}
            disabled={characterStats.mana <= 0}
          >
            Cast Spell
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleStatChange('experience', 100)}
          >
            Gain XP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamingMode;