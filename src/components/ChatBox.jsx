import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const ChatBox = () => {
    // work on storing messages for each session
    // so messages in chat don't vanish when switching pages
//   const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState(() => {

    const savedHistory = sessionStorage.getItem('messages');
    return savedHistory ? JSON.parse(savedHistory) : [];
  })

  const textareaRef = useRef(null);
//   const messagesEndRef = useRef(null);

  const handleSend = async () => {

    if (userInput.trim()) {

      const newMessages = [...messages, {role: 'user', content: userInput}];
      setMessages(newMessages);
      setUserInput(''); // clearing input after user sends message

    //   const updateChatHistory = [...chatHistory, {role: 'user', content: userInput}];
    //   setChatHistory(updateChatHistory); // triggering useeffect saving session storage

      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          messages: newMessages,
        });

        const assistantReply = {role: 'assistant', content: response.data.message.content};
        setMessages(prevMessages => [...prevMessages, assistantReply]);

        // const updateWithChatAssistant = [...newMessages, assistantReply];
        // setMessages(newMessages);

      } catch (error) {

        console.error('Error fetching API:', error);

        const errorMessage = {role: 'assistant', content: 'Error: Unable to fetch response from tutor agent.'};
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    }
  };

  const adjustTextareaHeight = () => {

    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  // update message history when state of [messages] changes 
  useEffect(() => {

    sessionStorage.setItem('messages', JSON.stringify(messages))
  }, [messages])

  // remove message history in case tab / browser closes or reloads  
  useEffect(() => {

    const handleBeforeUnload = () => {
        sessionStorage.removeItem('messages');
    }
    // adding event listener for when tab or browser is closed
    window.addEventListener('beforeunload', handleBeforeUnload);
    // removing listener once unmounted
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  // adjust text area box when state of [useInput] changes 
  useEffect(() => {

    adjustTextareaHeight();
  }, [userInput])

//   useEffect(() => {

//     if (messagesEndRef.current) {
//         messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
//     }
//   }, [messages]);

  return (
    <div className='bg-gray-800 p-4 rounded h-full flex flex-col'>
      <div className='flex-1 overflow-y-auto mb-4'>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-800'}`}>
              {msg.content}
            </span>
          </div>
        ))}
        {/* <div ref={messagesEndRef}/> */}
      </div>
      <div className='flex'>
        <div className='flex items-end flex-grow'>
            <textarea
            ref={textareaRef}
            className="flex-1 p-2 rounded-l bg-gray-700 resize-none"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSend()}
            rows={1}
            style={{overflow: 'hidden'}}
            />
            <button className="ml-2 p-2 bg-blue-400 rounded flex-shrink-0" style={{ width: '50px', height: '40px' }} onClick={handleSend}>
                <img src="/send-button.png" alt="Send" style={{ width: '100%', height: '100%' }}/>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;


// // return (
// //     <div className="bg-gray-700 p-4 rounded h-full flex flex-col">
// //       <div className="flex-1 overflow-y-auto mb-4">
// //         {messages.map((msg, index) => (
// //           <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
// //             <p className="bg-gray-700 inline-block p-2 rounded">
// //               {msg.text}
// //             </p>
// //           </div>
// //         ))}
// //       </div>
// //       <form onSubmit={handleSend} className="flex">
// //         <input
// //           className="flex-1 p-2 rounded-l bg-gray-800"
// //           type="text"
// //           value={userInput}
// //           onChange={(e) => setUserInput(e.target.value)}
// //           placeholder="Type your message..."
// //         />
// //         <button className="p-2 bg-blue-500 rounded-r" onClick={handleSend}>
// //           Send
// //         </button>
// //       </form>
// //     </div>
// //   );


// }