import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import remarkGfm from 'remark-gfm'
import LatexRenderer from './LatexRenderer';
import { supabase } from '../supabaseClient';

// confirm deleteion
const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center bg-[#1f2937] p-6 rounded border-[1px] border-[#ffe523]
            text-[#ffda06]">
                <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
                <p className="mb-4">Are you sure you want to delete your chat history?</p>
                <div className="flex justify-center">
                    <button
                        className="mr-2 px-4 py-2 bg-[#111827] rounded hover:bg-[#233359]
                        "
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-[#111827] text-[#ff0000] hover:text-[#ffda06] font-bold rounded hover:bg-[#ff0000]"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatBox = ({ messages = [], setMessages, username }) => {

    // console.log("Messages in ChatBox:", messages);
    const [userInput, setUserInput] = useState('');
    // const [messages, setMessages] = useState(() => {
    //     // storing / redisplaying message history current session
    //     const savedHistory = sessionStorage.getItem('messages');
    //     return savedHistory ? JSON.parse(savedHistory) : [];
    // })
    const [name, setName] = useState('')
    const [isTyping, setIsTyping] = useState(false);
    // const [hasNewMessages, setHasNewMessages] = useState(false); // tracking new messages
    const [isModalOpen, setIsModalOpen] = useState(false)
    // const [isUserScrolling, setIsUserScrolling] = useState(false);

    //use references to dom elements
    const assistantMessageRef = useRef(''); // accumulate streaming data
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const isComponentMounted = useRef(false); // ref to track if component just mounted

    // sends user message and handles the streaming response from backend
    const handleSend = useCallback(async () => {

        if (!Array.isArray(messages)) {
            console.error("messages is not an array");
            return;
        }
        // trimming users input + exiting if input is empty
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;
        // creating new user message obj
        const newUserMessage = { role: 'user', content: trimmedInput };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsTyping(true);

        const userName = name;

        const saveUserMessage = async () => {
            const userId = JSON.parse(sessionStorage.getItem('userId'));
            if (!userId) return;

            try {
                const { error } = await supabase
                    .from('chat_history')
                    .insert([{
                        user_id: userId,
                        content: newUserMessage.content,
                        role: 'user',
                        created_at: new Date().toISOString(),
                    }]);

                if (error) {
                    console.error('Error saving user message:', error.message);
                }
            } catch (err) {
                console.error('Unexpected error saving user message:', err);
            }
        };
        await saveUserMessage();

        assistantMessageRef.current = ''; // resetting reference to store assistants message during streaming

        const baseURL = process.env.NODE_ENV === 'production'
            ? 'https://discrete-mentor-16b9a1c9e019.herokuapp.com'
            : 'http://localhost:5000';

        try { // sending user message to backend api, (await)ing for the response
            const response = await fetch(`${baseURL}/api/chat`, {
                // const response = await fetch('https://discrete-mentor-16b9a1c9e019.herokuapp.com/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: updatedMessages, userName }),
            });
            // error handling
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // getting readable stream from 'response body'
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8'); // creating TextDecoder to convert bytes to text
            // continuously reading from stream unti done
            while (true) {
                // reading next chunk of data
                const { done, value } = await reader.read();
                if (done) break; // exiting loop when no more data
                // decoding chunk of data from bytes to string
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim() !== ''); // splitting chunk into lines, filtering out empty lines
                // going through each line of chunk
                for (const line of lines) {
                    // processing data if line starts with 'data: ' 
                    if (line.startsWith('data: ')) {
                        // & removing 'data: ' from start of line
                        const data = line.replace('data: ', '');
                        // if data is '[DONE]', stop typing + return
                        if (data === '[DONE]') {
                            setIsTyping(false);
                            const saveGPTMessage = async () => {
                                const userId = JSON.parse(sessionStorage.getItem('userId'));
                                if (!userId) return;

                                try {
                                    const { error } = await supabase
                                        .from('chat_history')
                                        .insert([{
                                            user_id: userId,
                                            content: assistantMessageRef.current,
                                            role: 'assistant',
                                            created_at: new Date().toISOString(),
                                        }]);

                                    if (error) {
                                        console.error('Error saving GPT response:', error.message);
                                    }
                                } catch (err) {
                                    console.error('Unexpected error saving GPT response:', err);
                                }
                            };
                            await saveGPTMessage();
                            return;
                        }

                        try { // parsing data into JSON format
                            const parsed = JSON.parse(data);
                            const text = parsed.content || ''; // extracting content (text) from parsed data
                            // text = text.replace(/\n/g, '\n\n'); // separating paragraphs
                            assistantMessageRef.current += text; // appending to current assistants (gpt) message
                            // updating state with latest assistant message
                            setMessages(prevMessages => {
                                const lastMessage = prevMessages[prevMessages.length - 1];

                                let updatedMessages;

                                if (lastMessage && lastMessage.role === 'assistant') {
                                    updatedMessages = [
                                        ...prevMessages.slice(0, -1),
                                        { ...lastMessage, content: assistantMessageRef.current },
                                    ];
                                } else {
                                    updatedMessages = [
                                        ...prevMessages,
                                        { role: 'assistant', content: assistantMessageRef.current },
                                    ];
                                }
                                sessionStorage.setItem('messages', JSON.stringify(updatedMessages));

                                return updatedMessages;
                            });
                        } catch (error) { // error handling while parsing streaming data
                            console.error('Error parsing streaming data:', error);
                        }
                    }
                }
            }
        } catch (error) {
            // error handling during fetch requests or streaming process
            console.error('Error with fetching stream:', error);
            setMessages(prevMessages => [
                ...prevMessages,
                { role: 'assistant', content: 'Error: Unable to fetch response from tutor agent.' },
            ]);
            setIsTyping(false); // stopping the gpts typing indication
        }
    }, [userInput, messages, setMessages]);

    const handleDeleteChatHistory = async () => {
        const userId = JSON.parse(sessionStorage.getItem('userId'));
        if (!userId) return;

        try {
            const { error } = await supabase
                .from('chat_history')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('error deleting chat history:', error.message)
            } else {
                setMessages([]);
                sessionStorage.removeItem('messages')
                // console.log('chat history deleted');
            }
        } catch (error) {
            console.error('error deleting chat history:', error)
        }
    }

    const handleConfirmDelete = () => {
        handleDeleteChatHistory();
        setIsModalOpen(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        const savedName = sessionStorage.getItem('name')
        if (savedName){
            const fullName = JSON.parse(savedName);
            const firstName = fullName.split(' ')[0];
            setName(firstName)
        }
    }, [username])

    // user text input box height adjustment in case of larger prompts 
    const adjustTextareaHeight = useCallback(() => {

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    // adjusting text area box when state of [useInput] changes 
    useEffect(() => {

        adjustTextareaHeight();
    }, [userInput, adjustTextareaHeight])

    // // scroll to newest incoming message if new messages incoming + its not page navigation
    // useEffect(() => {

    //     if (isComponentMounted.current && hasNewMessages && messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     } else {
    //         setHasNewMessages(false); // reset after page load or remount
    //     }
    // }, [messages, hasNewMessages]);

    // set component as mounted after initial load
    useEffect(() => {
        isComponentMounted.current = true;
    }, []);

    // updating message history when state of [messages] changes 
    // useEffect(() => {
    //         sessionStorage.setItem('messages', JSON.stringify(messages));

    // }, [messages])

    // const savedChatHistory = async () => {
    //     const userId = JSON.parse(sessionStorage.getItem('userId'))
    //     if (!userId) return;

    //     const chatHistory = messages.map((message, index) => ({
    //         user_id: userId,
    //         content: message.content,
    //         role: message.role,
    //         created_at: new Date(new Date().getTime() + index).toISOString(),
    //     }))

    //     try {
    //         const { error } = await supabase
    //             .from('chat_history')
    //             .insert(chatHistory);

    //         if (error) {
    //             console.error('Error saving chat history:', error.message);
    //         }

    //     } catch (err) {
    //         console.error('Unexpected error saving chat history:', err);
    //     }


    // }
    // savedChatHistory();

    // removing message history in case tab / browser closes or reloads  
    // useEffect(() => {

    //     const handleBeforeUnload = () => {
    //         sessionStorage.removeItem('messages');
    //     }
    //     // adding event listener for when tab or browser is closed
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    //     // removing listener once unmounted
    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     }
    // }, [])


    const cleanLatexResponse = useCallback((content) => {

        // regex to detect latex code between $...$ or $$...$$
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$|`(.*?)`|\\\[(.*?)\\\]/g;
        // regex to check if latex already wrapped  with $$..$$ or \(..\)
        const alreadyWrappedLatex = /(\$\$(.*?)\$\$)|\\\((.*?)\\\)/g
        // detect raw latex without wrappings
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|[A-Za-z]+)\b/g
        // Check if question contains LaTeX
        const hasLatex = latexRegex.test(content);
        // check for no latex wrappings
        const hasRawLatex = rawLatexRegex.test(content)

        if (hasLatex) {

            let cleanedContent = content.replace(/`/g, '');

            cleanedContent = cleanedContent.replace(/\\[\]]/g, '');

            cleanedContent = cleanedContent.replace(/\$/g, '');

            cleanedContent = `$$ ${cleanedContent} $$`;

            return cleanedContent;
        }
        else {
            // Render non-LaTeX question as plain HTML
            return content;
        }
    }, [])

    return (
        <div className='bg-gray-800 border-[2px] border-amber-500 border-opacity-50 py-2 rounded h-full flex flex-col'>
            <div className='chatbox-content flex-1 overflow-y-auto mb-4 overflow-x-hidden'>
                <div className='flex justify-center mb-[30px]'>
                    <h3 className='d-mentor-title md:fixed z-20 bg-[rgba(187,121,35,0.19)]'>DiscreteMentor</h3>
                </div>
                {/* <button
                    className="fixed mt-0 px-0 py-0 z-50
                                transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                >
                    <img className='xxxsm:w-[18px] xxsm:w-[18px] xsm:w-[18px] sm:w-[18px] md:w-[18px] lg:w-[18px] xl:w-[18px]'
                        alt='delete' src='./clear-chat-history.svg' />
                </button> */}
                {messages.length > 0 ? (messages.map((msg, index) => (
                    <div key={index} className={`mb-2 mt-2 ${msg.role === 'user' ? 'text-left' : 'text-left'}`}>
                        <span className={`latex-container inline-block p-2 rounded ${msg.role === 'user' ?
                            '' : 'bg-[rgba(53,57,66,0)] text-white'} 
                        break-words max-w-full whitespace-normal`}>
                            {msg.role === 'assistant' ? (
                                <>
                                    <div className='flex items-start flex-col '>
                                        <img className="w-[40px] h-auto mr-0 b-[rgba(255,208,0,0.51)] rounded border-[1px] border-[rgba(255,170,0,0.43)]" 
                                        alt="Tutor" src="/D.Mentor1.png" />
                                        {/* {console.log(msg.content)} */}
                                        {/* {console.log(cleanLatexResponse(msg.content))} */}
                                        <div className='bg-[rgba(69,41,96,0.16)] rounded-[10px] p-[2px]'>
                                            <LatexRenderer content={msg.content} />
                                        </div>
                                    </div>

                                </>
                            ) : (
                                <>
                                    <div className='flex flex-col items-start space-y-1'>
                                        <span className='font-semibold px-2 bg-gradient-to-r from-[rgb(75,143,211)] to-[rgb(12,103,152)] hover:from-[rgb(12,103,152)]  
                                                hover:to-[rgb(75,143,211)] text-[10px] text-[rgb(0,0,0)]
                                                focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0)] rounded'>
                                            {name}
                                        </span>
                                        {/* <img className="w-6 h-auto mr-2" alt="Tutor Icon" src="/logo.png" /> */}
                                        {/* {console.log(msg.content)} */}
                                        {/* {console.log(cleanLatexResponse(msg.content))} */}
                                        <div className='bg-[rgba(65,86,129,0.23)] rounded-[10px] p-[2px]'>
                                            <LatexRenderer content={msg.content} />
                                        </div>

                                    </div>

                                </>
                            )}
                        </span>
                    </div>
                ))) : (
                    <div className='d-mentor-box 
                            xxxsm:mt-[80px] xxsm:mt-[80px] xsm:mt-[50px] sm:mt-[40px] md:mt-[70px] lg:mt-[50px] xl:mt-[50px]'> {/* xxxsm:gap-12 xxsm:gap-10 xsm:gap-10 sm:gap-10 md:gap-28 lg:gap-24 xl:gap-28 */}
                        {/* <h3 className='d-mentor-title'>DiscreteMentor</h3> */}
                        <img className="d-mentor xxxsm:w-[250px] xxsm:w-[275px] xsm:w-[350px] sm:w-[400px] md:w-[255px] lg:w-[322px] xl:w-[333px]
                                        xxxsm:h-[250px] xxsm:h-[275px] xsm:h-[350px] sm:h-[400px] md:h-[266px] lg:h-[333px] xl:h-[333px]"
                            src='/D.Mentor1.png' />
                    </div>
                )}
                {isTyping && (
                    <div className='mb-2 text-left'>
                        <span className='inline-block p-2 rounded'>
                            <img className='typing-gif' alt='... ...' src='/loading2.1.gif' />
                        </span>
                    </div>
                )}
                {/* <div ref={messagesEndRef}/> */}
            </div>
            <div className='flex'>
                {/* <div className='flex items-end flex-grow'> */}
                    <div className='flex items-end justify-center space-x-1 flex-grow'>
                        <button
                            className=" mb-[8px] px-0 py-0 outline-none focus:outline-none
                                transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <img className='xxxsm:w-[18px] xxsm:w-[18px] xsm:w-[18px] sm:w-[18px] md:w-[18px] lg:w-[18px] xl:w-[18px]'
                                alt='delete' src='./clear-chat-history.svg' />
                        </button>
                        <textarea
                            placeholder='Message Tutor'
                            ref={textareaRef}
                            className="flex-1 p-2 rounded-2xl bg-gray-700 focus:outline-none 
                                 focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto break-words"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            rows={1}
                            style={{ maxHeight: '400px' }}
                        />
                        <button
                            className="ml-1 px-0 py-0 outline-none 
                        focus:outline-none border-2 border-yellow-600 hover:border-yellow-600 rounded-full transform  
                        transition duration-75 ease-in-out hover:scale-105 active:scale-95"
                            // className="ml-2 p-2 bg-blue-400 focus:outline-none 
                            //          focus:ring-1 focus:ring-amber-500 rounded-2xl flex-shrink-0" 
                            // style={{width: '50px', height: '40px'}} 
                            onClick={handleSend}
                            disabled={isTyping}
                        >
                            {/* <img src="/send-button.png" alt="Send" style={{width: '100%', height: '100%'}} /> */}
                            <img className="w-10 h-auto xxxsm:w-[30px] xxsm:w-[33px] xsm:w-[35px] sm:w-[37px] md:w-[37px] lg:w-[40px] xl:w-[40px] mr-0"
                                alt="Submit" src="/submit2.svg" />
                        </button>
                    </div>

                    <ConfirmationModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onConfirm={handleConfirmDelete}
                    />
                {/* </div> */}
            </div>
        </div>
    );
};

export default ChatBox;


{/* <div className='flex items-center justify-center space-x-1'>


<button
    className="ml-1 px-0 py-0 outline-none 
focus:outline-none border-2 border-yellow-600 hover:border-yellow-600 rounded-full transform  
transition duration-75 ease-in-out hover:scale-105 active:scale-95"
    // className="ml-2 p-2 bg-blue-400 focus:outline-none 
    //          focus:ring-1 focus:ring-amber-500 rounded-2xl flex-shrink-0" 
    // style={{width: '50px', height: '40px'}} 
    onClick={handleSend}
    disabled={isTyping}
>
  
    <img className="w-10 h-auto xxxsm:w-[30px] xxsm:w-[33px] xsm:w-[35px] sm:w-[37px] md:w-[37px] lg:w-[40px] xl:w-[40px] mr-0"
        alt="Submit" src="/submit2.svg" />
</button>
<button
    className=" mt-0 px-0 py-0 
        transform transition duration-75 ease-in-out hover:scale-105 active:scale-95"
    onClick={() => setIsModalOpen(true)}
>
    <img className='xxxsm:w-[18px] xxsm:w-[18px] xsm:w-[18px] sm:w-[18px] md:w-[18px] lg:w-[18px] xl:w-[18px]'
        alt='delete' src='./clear-chat-history.svg' />
</button>
</div> */}