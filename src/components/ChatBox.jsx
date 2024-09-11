import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatBox = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

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

  const adjustTextareaHeight = () => {

    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  useEffect(() => {

    adjustTextareaHeight();
  }, [input])

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
        <div className='flex items-end'>
            <textarea
            ref={textareaRef}
            className="flex-1 p-2 border rounded resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSend()}
            rows={1}
            style={{overflow: 'hidden'}}
            />
            <button className="ml-2 p-2 bg-white rounded flex-shrink-0" style={{ width: '50px', height: '40px' }} onClick={handleSend}>
                <img src="/send-button.png" alt="Send" style={{ width: '100%', height: '100%' }}/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;