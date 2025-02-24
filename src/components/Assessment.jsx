// src/components/Assessment.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../style.css";
import Navbar from './Navbar';

// Updated function to format message content into nicely separated paragraphs.
// It makes headings bold (e.g. lines starting with "Diagnosis") and indents bullet points.
const formatMessageContent = (content) => {
  const lines = content.split("\n");
  return lines.map((line, index) => {
    const trimmed = line.trim();
    if (/^(•\s*)?diagnosis\s*\d+/i.test(trimmed)) {
      return <p key={index} className="font-bold">{trimmed}</p>;
    } else if (trimmed.startsWith("-")) {
      return <p key={index} style={{ marginLeft: '1rem' }}>{trimmed}</p>;
    } else {
      return <p key={index}>{trimmed}</p>;
    }
  });
};

const Assessment = () => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [state, setState] = useState({
    symptoms: [],
    askedQuestions: [],
    riskLevel: 'low'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Speech-to-text handler using the Web Speech API
  const handleSpeechInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Immediately add user's message to conversation and clear input.
    const userMsg = { type: 'user', content: input };
    setConversation(prev => [...prev, userMsg]);
    setInput('');

    // Add a temporary bot message to show loading (simulate "thinking")
    const tempBotMsg = { type: 'bot-loading', content: "Analyzing your symptoms..." };
    setConversation(prev => [...prev, tempBotMsg]);

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/process-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          state: state
        }),
      });
      const data = await response.json();

      // Remove the temporary loading message and append the actual bot responses.
      setConversation(prev => {
        const newConvo = prev.filter(msg => msg.type !== 'bot-loading');
        const botMsgs = [{ type: 'assessment', content: data.assessment }];
        if (!data.finalized) {
          botMsgs.push({ type: 'question', content: data.question });
        }
        return [...newConvo, ...botMsgs];
      });

      setState(data.state);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing request');
      // Remove temporary loading message if an error occurs.
      setConversation(prev => prev.filter(msg => msg.type !== 'bot-loading'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="webcrumbs">
      <Navbar />

      {/* Title and Subtitle */}
      <div className="heading-box mb-8">
        <h2>AI Symptom Assessment</h2>
        <p>Describe your symptoms for a personalized risk analysis</p>
      </div>

      {/* Main Content */}
      <main className="content-container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Fixed Current Risk Level Indicator */}
        <div className={`fixed bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg text-center text-xl font-semibold ${state.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
          state.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          Current Risk Level: <span className="capitalize">{state.riskLevel}</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="conversation-container space-y-6 mb-6">
            {conversation.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-lg">
                Start by describing your symptoms below...
              </div>
            )}

            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-6 rounded-lg mb-4 ${msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : (msg.type === 'bot-loading' ? 'bg-gray-200 text-gray-700 italic' : 'bg-white text-gray-800')
                  }`}>
                  {msg.type === 'assessment' && (
                    <div className="mb-2 flex items-center gap-2 text-blue-600">
                      <span className="material-symbols-outlined">clinical_notes</span>
                      <span className="font-semibold">Assessment:</span>
                    </div>
                  )}
                  {msg.type === 'question' && (
                    <div className="mb-2 flex items-center gap-2 text-gray-600">
                      <span className="material-symbols-outlined">contact_support</span>
                      <span className="font-semibold">Follow-up Question:</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {formatMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input-container bg-gray-50 rounded-xl p-2 flex gap-2 shadow-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
              placeholder="Describe your symptoms here..."
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSpeechInput}
              className="mic-button bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined">mic</span>
            </button>
            <button
              type="submit"
              className="submit-button bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              <span className="material-symbols-outlined">send</span>
              {isLoading ? 'Analyzing...' : 'Send'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Assessment;