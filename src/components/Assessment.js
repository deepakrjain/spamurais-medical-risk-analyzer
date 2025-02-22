import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';

export default function Assessment() {
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chatMessages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [input, setInput] = useState('');
    const [state, setState] = useState(() => {
        const savedState = localStorage.getItem('chatState');
        return savedState ? JSON.parse(savedState) : { symptoms: [], askedQuestions: [], riskLevel: 'low' };
    });
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        localStorage.setItem('chatState', JSON.stringify(state));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newUserMessage = { type: 'user', content: input };
        setMessages((prev) => [...prev, newUserMessage]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: input, state })
            });


            if (!response.ok) throw new Error('Server error');

            const { assessment, nextQuestion, updatedState } = await response.json();
            setMessages((prev) => [
                ...prev,
                { type: 'bot', content: assessment },
                nextQuestion ? { type: 'bot', content: nextQuestion } : null
            ].filter(Boolean));
            setState(updatedState);
        } catch (error) {
            setMessages((prev) => [...prev, { type: 'bot', content: 'Error processing request. Please try again.' }]);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Medical Risk Assessment</h1>

                <div className="h-[400px] overflow-y-auto space-y-4 p-2">
                    {messages.map((msg, i) => (
                        <div key={i} className={`p-3 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-100'}`}>{msg.content}</div>
                    ))}
                    <div ref={chatEndRef}></div>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your symptoms..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <Button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled={loading}>
                        {loading ? '...' : 'Send'}
                    </Button>
                </form>
            </div>
        </div>
    );
}