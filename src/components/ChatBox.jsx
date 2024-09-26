import React, {useState, useRef, useEffect, useCallback} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import remarkGfm from 'remark-gfm'

const ChatBox = () => {

    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState(() => {
        // storing / redisplaying message history current session
        const savedHistory = sessionStorage.getItem('messages');
        return savedHistory ? JSON.parse(savedHistory) : [];
    })
    const [isTyping, setIsTyping] = useState(false);
    // const [isUserScrolling, setIsUserScrolling] = useState(false);

    //use references to dom elements
    const assistantMessageRef = useRef(''); // accumulate streaming data
    // const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

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

        try { // sending user message to backend api, (await)ing for the response
            const response = await fetch('http://localhost:5000/api/chat', {
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

    // scroll to newest incoming message
    // useEffect(() => {

    //     if (messagesEndRef.current) {
    //         messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    //     }
    // }, [messages]); 

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


   /**
   * cleans latex response by removing unnecessary markdown syntax
   * + ensuring proper formatting for latex rendering
   * @param {string} content - raw content from assistant
   * @returns {string} - cleaned content
   */

    // cleaning latex, removing markdown notation for proper displaying
    const cleanLatexResponse = useCallback(content => {

        let cleanedContent = content;
    
        // replacing triple backticks with $$ for latex blocks
        cleanedContent = cleanedContent.replace(/```(?:math|latex)?\n([\s\S]*?)\n```/g, '$$$1$$');
    
        // removing any remaining single backticks
        cleanedContent = cleanedContent.replace(/`/g, '');
    
        // ensuring latex expressions are on their own lines + use consistent delimiters
        cleanedContent = cleanedContent.replace(/\$\$([^$]+)\$\$/g, '\n$$$1$$\n');
    
        // replacing double backslashes with single
        cleanedContent = cleanedContent.replace(/\\\\/g, '\\');

        // 3.
        // handling specific formatting for matrices: 
        // ensuring newlines inside matrices are correctly kept
        cleanedContent = cleanedContent.replace(/\\begin{(pmatrix|bmatrix)}\$/g, '\n$$\\begin{$1}');
        cleanedContent = cleanedContent.replace(/\\end{(pmatrix|bmatrix)}\s*\$/g, '\\end{$1}\n$$');
 


        // 2.
        // replacing \ots with \cdots (since gpt left out the 'c')
        cleanedContent = cleanedContent.replace(/\\ots/g, '\\cdots');

        // // ensuring power symbols are present (handle missing `^` before exponents)
        // cleanedContent = cleanedContent.replace(/(\d)(\d+)/g, '$1^{$2}'); // fixes b2 to b^2


        // 4.
        // ensuring proper spacing between inline math and text
        // cleanedContent = cleanedContent.replace(/([^\n])(\$\S)/g, '$1\n$2');  // adding new line before inline latex if missing
        // cleanedContent = cleanedContent.replace(/(\$\S)([^\n])/g, '$1\n$2');  // adding new line after inline latex if missing

        // // ensuring proper spacing around display math and text
        // cleanedContent = cleanedContent.replace(/([^\n])(\n\$\$)/g, '$1\n\n$2');  // add double new lines before display math
        // cleanedContent = cleanedContent.replace(/(\$\$\n)([^\n])/g, '$1\n\n\n$2');    // add new line after display math




        // 1.
        
        // handling display math + inline math consistently
        // converting display math using \[ \] to $$
        cleanedContent = cleanedContent.replace(/\\\[([^]+?)\\\]/g, '\n$$$1$$\n');

        // converting inline math using \( \) to single $
        cleanedContent = cleanedContent.replace(/\\\(([^]+?)\\\)/g, '$$ $1 $$');
    
        // handling common subscript and superscript issues
        // removing any unnecessary newlines or spaces inside math delimiters
        // cleanedContent = cleanedContent.replace(/\$\s+([^$]+)\s+\$/g, '$$$1$$');


    
        // trimming unnecessary whitespace
        return cleanedContent.trim();
    }, []);

    // renderer / displayer for code blocks: latex, syntax highlighting
    const renderers = {

        paragraph: ({ node, children }) => {

            const hasBlockChild = children.some(child =>

                typeof child === 'object' &&
                (child.type === 'code' || child.type === 'div')
            );
            return hasBlockChild ? <div>{children}</div> : <p>{children}</p>;
        },

        code({ node, inline, className, children, ...props }) {

            if (inline) {
                return (
                    <code
                        className="bg-gray-700 p-1 rounded whitespace-pre-wrap break-words"
                        {...props}
                    >
                        {children}
                    </code>
                );
            }

            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            // detecting and rendering latex blocks
            if (/^\$\$.*\$\$$/.test(codeContent.trim())) {

                const math = codeContent.replace(/^\$\$(.*)\$\$$/, '$1').trim();
                return (
                    <div className="math-block overflow-x-auto">
                        <ReactMarkdown
                            children={`$$${math}$$`}
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                        // className="max-w-full break-words" 
                        />
                    </div>
                )
            }

            // applying syntax highlighting for code blocks
            if (match) {

                const language = match[1];
                const highlighted = hljs.getLanguage(language)
                    ? hljs.highlight(codeContent, { language }).value
                    : hljs.highlightAuto(codeContent).value;

                return (
                    <pre className="my-2 overflow-x-auto">
                        <code
                            className={`language-${language} hljs`}
                            dangerouslySetInnerHTML={{ __html: highlighted }}
                        />
                    </pre>
                );
            }

            return (
                <pre className="my-2 overflow-x-auto">
                    <code className="hljs" {...props}>
                        {children}
                    </code>
                </pre>
            );
        },
    };

    return (
        <div className='bg-gray-800 p-4 rounded h-full flex flex-col'>
            <div className='chatbox-content flex-1 overflow-y-auto mb-4 overflow-x-hidden'>
                {messages.length > 0 ? (messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`latex-container inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-800'
                            } break-words max-w-full whitespace-normal`}>
                            {msg.role === 'assistant' ? (
                                <>
                                {/* {console.log(msg.content)}
                                {console.log(cleanLatexResponse(msg.content))} */}
                                <ReactMarkdown
                                    children={cleanLatexResponse(msg.content)}
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={renderers}
                                    className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-full break-words"
                                />
                                </>
                            ) : (
                                msg.content
                            )}
                        </span>
                    </div>
                ))) : (
                    <div className='d-mentor-box'>
                        <h3>DiscreteMentor</h3>
                        <img className="d-mentor" src='/D.Mentor2.png'/>
                        {/* <img className='typing-gif' alt='... ...' src='/loading.gif'/> */}
                    </div>
                )}
                {isTyping && (
                    <div className='mb-2 text-left'>
                        <span className='inline-block p-2 rounded bg-gray-800 text-white'>
                            <em><img className='typing-gif' alt='... ...' src='/loading.gif'/></em>
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
                        className="flex-1 p-2 rounded-2xl bg-gray-700 resize-none break-words"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        rows={1}
                        style={{ overflow: 'hidden' }}
                    />
                    <button 
                        className="ml-2 p-2 bg-blue-400 rounded-2xl flex-shrink-0" 
                        style={{width: '50px', height: '40px'}} 
                        onClick={handleSend}
                        disabled={isTyping}
                    >
                        <img src="/send-button.png" alt="Send" style={{width: '100%', height: '100%'}} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
