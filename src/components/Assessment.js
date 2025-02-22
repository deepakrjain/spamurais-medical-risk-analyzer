import React, { useState } from 'react';

const Assessment = () => {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [state, setState] = useState({
    symptoms: [],
    askedQuestions: [],
    riskLevel: 'low'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/process-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: input,
          state: state  // Send current state
        }),
      });
      
      const data = await response.json();
      
      setConversation([...conversation, 
        { type: 'user', content: input },
        { type: 'assessment', content: data.assessment },
        { type: 'question', content: data.question }
      ]);
      
      setState(data.state);  // Update state with server response
      setInput('');
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing request');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4 space-y-4">
        {conversation.map((msg, index) => (
          <div key={index} className={`p-4 rounded-lg ${
            msg.type === 'user' ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            <p className="font-medium">{msg.type === 'user' ? 'You:' : 'Doctor:'}</p>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Describe your symptoms..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Assessment;