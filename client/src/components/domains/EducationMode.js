import React, { useState } from 'react';
import Button from '../common/Button';
import {
  BookOpenIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const EducationMode = ({ storyData, onUpdate }) => {
  const [learningObjectives, setLearningObjectives] = useState([
    { id: 1, text: 'Understand historical context', completed: false },
    { id: 2, text: 'Analyze character motivations', completed: false },
    { id: 3, text: 'Identify key themes', completed: false }
  ]);

  const [knowledgeCheck, setKnowledgeCheck] = useState({
    questions: [
      {
        id: 1,
        question: 'What was the main conflict in this story?',
        options: ['A. Internal struggle', 'B. External threat', 'C. Both A and B', 'D. None of the above'],
        correct: 2,
        answered: false,
        userAnswer: null
      },
      {
        id: 2,
        question: 'Which character trait was most important?',
        options: ['A. Courage', 'B. Intelligence', 'C. Kindness', 'D. All of the above'],
        correct: 3,
        answered: false,
        userAnswer: null
      }
    ],
    score: 0,
    totalQuestions: 2
  });

  const [progress, setProgress] = useState({
    readingTime: 0,
    comprehensionScore: 0,
    engagementLevel: 'medium',
    notes: []
  });

  const [glossary, setGlossary] = useState([
    { term: 'Protagonist', definition: 'The main character in a story' },
    { term: 'Antagonist', definition: 'The character who opposes the protagonist' },
    { term: 'Conflict', definition: 'The struggle between opposing forces' }
  ]);

  const handleObjectiveComplete = (objectiveId) => {
    setLearningObjectives(prev => 
      prev.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, completed: !obj.completed }
          : obj
      )
    );
  };

  const handleAnswerQuestion = (questionId, answerIndex) => {
    setKnowledgeCheck(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, answered: true, userAnswer: answerIndex }
          : q
      )
    }));

    // Calculate score
    const question = knowledgeCheck.questions.find(q => q.id === questionId);
    if (question && answerIndex === question.correct) {
      setKnowledgeCheck(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  };

  const addNote = (note) => {
    setProgress(prev => ({
      ...prev,
      notes: [...prev.notes, {
        id: Date.now(),
        text: note,
        timestamp: new Date().toISOString()
      }]
    }));
  };

  const getEngagementColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEngagementBg = (level) => {
    switch (level) {
      case 'high': return 'bg-green-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Objectives */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
          Learning Objectives
        </h3>
        
        <div className="space-y-3">
          {learningObjectives.map(objective => (
            <div key={objective.id} className="flex items-center space-x-3">
              <button
                onClick={() => handleObjectiveComplete(objective.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  objective.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {objective.completed && <CheckCircleIcon className="w-4 h-4" />}
              </button>
              <span className={`text-sm ${
                objective.completed ? 'text-green-700 line-through' : 'text-gray-700'
              }`}>
                {objective.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge Check */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
          Knowledge Check
        </h3>
        
        <div className="space-y-4">
          {knowledgeCheck.questions.map(question => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{question.question}</h4>
              
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !question.answered && handleAnswerQuestion(question.id, index)}
                    disabled={question.answered}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      question.answered
                        ? index === question.correct
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : index === question.userAnswer
                          ? 'bg-red-100 border-red-300 text-red-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                        : 'hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {question.answered && (
                <div className="mt-3 text-sm">
                  {question.userAnswer === question.correct ? (
                    <span className="text-green-600">✓ Correct!</span>
                  ) : (
                    <span className="text-red-600">✗ Incorrect. The correct answer is: {question.options[question.correct]}</span>
                  )}
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Score:</span>
              <span className="text-lg font-bold text-blue-600">
                {knowledgeCheck.score} / {knowledgeCheck.totalQuestions}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(knowledgeCheck.score / knowledgeCheck.totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
          Progress Tracking
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">Reading Time</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(progress.readingTime / 60)}m {progress.readingTime % 60}s
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpenIcon className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">Comprehension</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {progress.comprehensionScore}%
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className={`text-2xl font-bold ${getEngagementColor(progress.engagementLevel)}`}>
              {progress.engagementLevel}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${getEngagementBg(progress.engagementLevel)} ${getEngagementColor(progress.engagementLevel)}`}>
              {progress.engagementLevel === 'high' ? 'Very Engaged' :
               progress.engagementLevel === 'medium' ? 'Moderately Engaged' :
               'Low Engagement'}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Study Notes</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {progress.notes.map(note => (
              <div key={note.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {note.text}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Add a note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addNote(e.target.value.trim());
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Glossary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Glossary</h3>
        
        <div className="space-y-3">
          {glossary.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-900">{item.term}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Tools</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            onClick={() => setProgress(prev => ({ ...prev, readingTime: prev.readingTime + 60 }))}
          >
            +1 Min Reading
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setProgress(prev => ({ ...prev, comprehensionScore: Math.min(100, prev.comprehensionScore + 10) }))}
          >
            +10% Comprehension
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setProgress(prev => ({ 
              ...prev, 
              engagementLevel: prev.engagementLevel === 'low' ? 'medium' : 
                             prev.engagementLevel === 'medium' ? 'high' : 'high'
            }))}
          >
            Increase Engagement
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              const newNote = `Study session at ${new Date().toLocaleTimeString()}`;
              addNote(newNote);
            }}
          >
            Add Study Note
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EducationMode;