import React, { useState } from 'react';
import axios from 'axios';

const ChatBox = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {

    if (input.trim()) {
      const newMessages = [...messages, { role: 'user', content: input }];
      setMessages(newMessages);
      setInput('');

      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          messages: newMessages,
        });

        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response.data.message.content }]);
      } catch (error) {
        console.error('Error fetching API:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Error: Unable to fetch response from tutor agent.' }]);
      }
    }
  };

  return (
    <div className='flex flex-col h-full p-4 bg-gray-300'>
      <div className='flex-1 overflow-y-auto mb-4'>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className='flex-none'>
        <div className='flex'>
            <input
            type="text"
            className="flex-1 p-2 border rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;