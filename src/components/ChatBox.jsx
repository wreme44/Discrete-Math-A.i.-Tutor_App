import React, {useState, useRef, useEffect, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import remarkGfm from 'remark-gfm'
import LatexRenderer from './LatexRenderer';

const ChatBox = () => {

    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState(() => {
        // storing / redisplaying message history current session
        const savedHistory = sessionStorage.getItem('messages');
        return savedHistory ? JSON.parse(savedHistory) : [];
    })
    const [isTyping, setIsTyping] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false); // tracking new messages
    // const [isUserScrolling, setIsUserScrolling] = useState(false);

    //use references to dom elements
    const assistantMessageRef = useRef(''); // accumulate streaming data
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const isComponentMounted = useRef(false); // ref to track if component just mounted

    // sends user message and handles the streaming response from backend
    const handleSend = useCallback(async () => {

        // trimming users input + exiting if input is empty
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;
        // creating new user message obj
        const newUserMessage = { role: 'user', content: trimmedInput };
        const updatedMessages = [...messages, newUserMessage];
        // updating messages state to include new user message, + clearing once sent
        setMessages(updatedMessages);
        setUserInput('');
        setIsTyping(true);
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
                body: JSON.stringify({ messages: updatedMessages }),
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
                const {done, value} = await reader.read();
                if (done) break; // exiting loop when no more data
                // decoding chunk of data from bytes to string
                const chunk = decoder.decode(value, {stream: true});
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
                                setHasNewMessages(true); // indicate that new messages incoming
                                if (lastMessage && lastMessage.role === 'assistant') {
                                    return [
                                        ...prevMessages.slice(0, -1),
                                        { ...lastMessage, content: assistantMessageRef.current },
                                    ];
                                } else {
                                    return [
                                        ...prevMessages,
                                        { role: 'assistant', content: assistantMessageRef.current },
                                    ];
                                }
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
    }, [userInput, messages]);

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

    // scroll to newest incoming message if new messages incoming + its not page navigation
    useEffect(() => {

        if (isComponentMounted.current && hasNewMessages && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        } else {
            setHasNewMessages(false); // reset after page load or remount
        }
    }, [messages, hasNewMessages]);

    // set component as mounted after initial load
    useEffect(() => {
        isComponentMounted.current = true;
    }, []);

    // updating message history when state of [messages] changes 
    useEffect(() => {

        sessionStorage.setItem('messages', JSON.stringify(messages))
    }, [messages])

    // removing message history in case tab / browser closes or reloads  
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
        <div className='bg-gray-800 border-[2px] border-amber-500 border-opacity-50 p-4 rounded h-full flex flex-col'>
            <div className='chatbox-content flex-1 overflow-y-auto mb-4 overflow-x-hidden'>
                {messages.length > 0 ? (messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`latex-container inline-block p-2 rounded ${msg.role === 'user' ? 
                        'bg-[rgba(65,86,129,0.43)] text-white' : 'bg-[rgba(53,57,66,0)]'} 
                        break-words max-w-full whitespace-normal`}>
                            {msg.role === 'assistant' ? (
                                <>
                                {/* {console.log(msg.content)} */}
                                {/* {console.log(cleanLatexResponse(msg.content))} */}
                                <LatexRenderer content={msg.content}/>
                                </>
                            ) : (
                                <LatexRenderer content={msg.content}/>
                            )}
                        </span>
                    </div>
                ))) : (
                    <div className='d-mentor-box xxxsm:gap-12 xxsm:gap-10 xsm:gap-10 sm:gap-10 md:gap-28 lg:gap-24 xl:gap-28'>
                        <h3>DiscreteMentor</h3>
                        <img className="d-mentor xxxsm:w-[200px] xxsm:w-[266px] xsm:w-[266px] sm:w-[300px] md:w-[266px] lg:w-[333px] xl:w-[333px]
                                        xxxsm:h-[200px] xxsm:h-[266px] xsm:h-[266px] sm:h-[300px] md:h-[266px] lg:h-[333px] xl:h-[333px]" 
                                        src='/D.Mentor1.png'/>
                        {/* <img className='typing-gif' alt='... ...' src='/loading2.1.gif'/> */}
                    </div>
                )}
                {isTyping && (
                    <div className='mb-2 text-left'>
                        <span className='inline-block p-2 rounded'>
                            <img className='typing-gif' alt='... ...' src='/loading2.1.gif'/>
                        </span>
                    </div>
                )}
                {/* <div ref={messagesEndRef}/> */}
            </div>
            <div className='flex'>
                <div className='flex items-end flex-grow'>
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
            </div>
        </div>
    );
};

export default ChatBox;
