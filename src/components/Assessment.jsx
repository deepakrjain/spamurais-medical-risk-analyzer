import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../style.css";
import Navbar from './Navbar'; // Import Navbar component

// Function to parse text and replace *text* with <strong>text</strong>
const formatMessageContent = (content) => {
    const parts = content.split(/(\*[^*]+\*)/g); // Split by text between asterisks
    return parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            // Remove asterisks and wrap in <strong> for bold
            const boldText = part.slice(1, -1);
            return <strong key={index}>{boldText}</strong>;
        }
        return part; // Return non-bold parts as is
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

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

            setConversation(prev => [
                ...prev,
                { type: 'user', content: input },
                { type: 'assessment', content: data.assessment },
                { type: 'question', content: data.question }
            ]);

            setState(data.state);
            setInput('');
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="webcrumbs">
          <Navbar />

            {/* Title and Subtitle in a Blue Box */}
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
                                <div className={`max-w-[70%] p-4 rounded-lg mb-4 ${msg.type === 'user'
                                    ? 'message-user bg-blue-600 text-white'
                                    : 'message-ai bg-gray-100 text-gray-800'
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
                                    <p className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}>
                                        {formatMessageContent(msg.content)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="loading-indicator flex justify-start">
                                <div className="max-w-[70%] p-4 bg-gray-100 rounded-lg">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <div className="animate-pulse">⚕️</div>
                                        <span>Analyzing your symptoms...</span>
                                    </div>
                                </div>
                            </div>
                        )}
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