import React, {useState, useRef, useEffect} from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {BlockMath, InlineMath} from 'react-katex';
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
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const handleSend = async () => {

        if (userInput.trim()) {

            const newMessages = [...messages, {role: 'user', content: userInput}];
            setMessages(newMessages);
            setUserInput(''); // clearing input field after user sends message
            setIsTyping(true);
            assistantMessageRef.current = ''; // resetting assistant message buffer

            fetch('http://localhost:5000/api/chat', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({messages: newMessages}),
            })
                .then((response) => {

                    if (!response.ok) {
                        throw new Error('network response was not ok');
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder('utf-8');
                    // let done = false;

                    const readStream = () => {

                        reader.read().then(({done, value}) => {
                            
                            if (done) {
                                
                                setIsTyping(false);
                                return;
                            }
                            const chunk = decoder.decode(value, {stream: true});
                            const lines = chunk.split('\n').filter((line) => line.trim() !== '');

                            for (const line of lines) {

                                if(line.startsWith('data: ')) {
                                    
                                    const data = line.replace('data: ', '');
                                    if (data === '[DONE]') {

                                        setIsTyping(false);
                                        return;
                                    }
                                    try {
                                        const parsed = JSON.parse(data);
                                        let text = parsed.content || '';
                                        // replace double with single backslashes for latex rendering
                                        // text = text.replace(/\\\\/g, '\\');
                                        assistantMessageRef.current += text;
                                        setMessages((prevMessages) => {
                                            
                                            const updateMessages = [...prevMessages];
                                            // checking if last message is from assistant
                                            if (
                                                updateMessages.length > 0 && 
                                                updateMessages[updateMessages.length - 1].role === 'assistant' 
                                            ) {
                                                // updating last assistant message
                                                updateMessages[updateMessages.length -1].content = assistantMessageRef.current;
                                            } else {
                                                // adding updated message from tutor assistant
                                                updateMessages.push({
                                                    role: 'assistant',
                                                    content: assistantMessageRef.current,
                                                })
                                            }
                                            return updateMessages;
                                        })
                                    } catch (error) {
                                        console.error('error parsing streaming data: ', error);
                                    }
                                }
                            }
                            readStream(); // continue reading stream
                        }).catch((error) => {
                            console.error('Error reading stream:', error);
                            setMessages((prevMessages) => [
                              ...prevMessages,
                              {role: 'assistant', content: 'Error: Unable to fetch response from tutor agent.'},
                            ]);
                            setIsTyping(false);
                        });
                    }
                    readStream();
                })
                .catch((error) => {

                    console.error('error with fetching stream: ', error);
                    setMessages((prevMessages) => [
                        ...prevMessages, 
                        {role: 'assistant', 
                        content: 'Error: Unable to fetch response from tutor agent.'},
                    ])
                    setIsTyping(false);
                })
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

    // scroll to newest incoming message
    useEffect(() => {

        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages]); 
    
    // cleaning latex, removing markdown notation for proper displaying
    const cleanLatexResponse = (content) => {

        let cleanedContent = content;

        // removes triple backticks around markdown sections
        cleanedContent = cleanedContent.replace(/```([\s\S]*?)```/g, (match, latexContent) => {

            if (!latexContent.includes('$')) {
                return `$$${latexContent.trim()}$$`;
            }
            return latexContent;
        })
        
        cleanedContent = content.replace(/```markdown([\s\S]*?)```/g, '$1');

        cleanedContent = cleanedContent.replace(/\[([\s\S]*?)\]/g, '$1$$')

        // removes single backticks
        cleanedContent = cleanedContent.replace(/`?/g, '');

        // ensures math expressions enclosed in `$$` are on their own lines for block-level math
        cleanedContent = cleanedContent.replace(/\$\$([^$]+)\$\$/g, '\n$$$1$$\n');

        // removes any unnecessary newlines in between lines inside math blocks to prevent raw output
        cleanedContent = cleanedContent.replace(/\$\$\s*\n/g, '$$\n').replace(/\n\s*\$\$/g, '\n$$');

        // replaces any extra backslashes
        cleanedContent = cleanedContent.replace(/\\\\/g, '\\');

        return cleanedContent.trim();
    };


    //     ```latex
//     \[ \neg (P \land Q) \equiv (\neg P) \lor (\neg Q) \]
    
//     \[ \neg (P \lor Q) \equiv (\neg P) \land (\neg Q) \]
//     ```

//     \[ \neg (P \land Q) \equiv (\neg P) \lor (\neg Q) \]
    
//     \[ \neg (P \lor Q) \equiv (\neg P) \land (\neg Q) \]


//     `$$ (\neg (P \land Q)) \equiv ((\neg P) \lor (\neg Q)) $$` and 
//     `$$ (\neg (P \lor Q)) \equiv ((\neg P) \land (\neg Q)) $$`


//     $ (\neg (P \land Q)) \equiv ((\neg P) \lor (\neg Q)) $
//   
//     $ (\neg (P \lor Q)) \equiv ((\neg P) \land (\neg Q)) $


    // using react-katex BlockMath instead of rehype-katex
    // const renderers = {

    //     code({ node, inline, className, children, ...props }) {

    //         const match = /language-(\w+)/.exec(className || '');
    //         const codeContent = children[0] || '';

    //         // Detect LaTeX code blocks
    //         if (!inline && match && (match[1] === 'latex' || match[1] === 'math')) {
    //             return (
    //                 <BlockMath math={codeContent.trim()} />
    //             );
    //         }

    //         // Regular code blocks with syntax highlighting
    //         if (!inline && match) {
    //             return (
    //                 <pre className='my-2'>
    //                     <code
    //                         className={`language-${match[1]} hljs`}
    //                         dangerouslySetInnerHTML={{
    //                             __html: hljs.highlight(codeContent, { language: match[1] }).value,
    //                         }}
    //                     />
    //                 </pre>
    //             );
    //         }

    //         // Inline code
    //         return (
    //             <code className="bg-gray-700 p-1 rounded" {...props}>
    //                 {children}
    //             </code>
    //         );
    //     },
    // };





    // renderer for code blocks: latex, syntax highlighting
    const renderers = {
        // solving issue where it detects p / div tags within p tags
        paragraph: ({node, children}) => {

            const hasBlockChild = children.some(child => 
                typeof child === 'object' &&
                (child.type === 'code' || child.type === 'div')
            )
            if (hasBlockChild) {
                return <div>{children}</div>
            }
            return <div>{children}</div>
        },

        code({ node, inline, className, children, ...props }) {

            // if (!Array.isArray(children) || children.length === 0){
            //     return <code className='bg-gray-700 p-1 rounded' {...props}></code>;
            // }

            if (!children || children.length === 0 || typeof children[0] !== 'string'){
                return <code className="bg-gray-700 p-1 rounded" {...props}></code>
            }

            const match = /language-(\w+)/.exec(className || '');
            const codeContent = children[0];

            // codeContent = cleanLatexResponse(codeContent);

            // to detect latex code blocks and render properly

            // if (!inline && (codeContent.startsWith('\\[') || codeContent.startsWith('\\('))) {

            //     const math = codeContent.replace(/\\\\/g, '\\').trim();

            //     if (math.startsWith('\\[') && math.endsWith('\\]')) {
            //         return <BlockMath math={math.replace(/\\[|\\]/g, '')}/>;
            //     } else {
            //         return <InlineMath math={math.replace(/\\\(|\\\)/g, '')}/>
            //     }
            // }
            
            // process latex content and render properly, using react markdown remarkmath rehypkatex
            if (!inline && (codeContent.startsWith('\\[') || codeContent.startsWith('\\(') || codeContent.startsWith('$$') || codeContent.startsWith('$'))) {
                // remove extra backslashes for correct latex parsing
                const math = codeContent.trim();
                return (
                    <div>
                        <ReactMarkdown
                            children={math}
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                        />
                    </div>
                    
                );
            }
            // apply wrapping + syntax highlighting to regular code block
            return !inline && match ? (
                <pre className='my-2 whitespace-pre-wrap break-words'>
                    <code
                        className={`language-${match[1]} hljs`}
                        dangerouslySetInnerHTML={{
                            __html: hljs.highlight(codeContent, { language: match[1] }).value,
                        }}
                        style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}
                    />
                </pre>
            ) : (
                <code 
                    className="bg-gray-700 p-1 rounded whitespace-pre-wrap break-words" 
                    {...props}
                    style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}
                >
                    {children}
                </code>
            );
        },
    };



    // const renderers = {
    //     code({ node, inline, className, children, ...props }) {
    //         const codeContent = children[0] || '';
    
    //         // Handle block LaTeX (e.g., $$...$$ or \[...\])
    //         if (!inline && (codeContent.startsWith('$$') || codeContent.startsWith('\\['))) {
    //             const math = codeContent.replace(/\$\$/g, '').replace(/\\\[|\\\]/g, '').trim();
    //             return math ? <BlockMath math={math} /> : <code>{codeContent}</code>;
    //         }
    
    //         // Handle inline LaTeX (e.g., $...$ or \(...\))
    //         if (inline && (codeContent.startsWith('$') || codeContent.startsWith('\\('))) {
    //             const math = codeContent.replace(/\$/g, '').replace(/\\\(|\\\)/g, '').trim();
    //             return math ? <InlineMath math={math} /> : <code>{codeContent}</code>;
    //         }
    
    //         // Handle other code blocks (non-LaTeX)
    //         return (
    //             <pre className='my-2 whitespace-pre-wrap break-words'>
    //                 <code className={`language-${className} hljs`} {...props}>
    //                     {children}
    //                 </code>
    //             </pre>
    //         );
    //     }
    // };




    // renders for code responses with syntax highlighting, inline for latex expr, math equations etc.
    // const renderers = {

    //     code({node, inline, className, children, ...props}) {

    //         console.log('Rendering code block:', {node, inline, className, children, ...props});

    //         if (!Array.isArray(children) || children.length === 0){
    //             return <code className='bg-gray-700 p-1 rounded' {...props}></code>;
    //         }

    //         const codeContent = children[0];
    //         // extrat lang from classname if avail and validating
    //         const match = /language-(\w+)/.exec(className || '');
    //         const language = match ? match[1] : '';

    //         if (!inline && language) {

    //             try {
    //                 const highlighted = hljs.highlight(codeContent, {language}).value;
    //                 return (
    //                     <pre className='my-2'>
    //                         <code
    //                             className={`language-${language} hljs`}
    //                             dangerouslySetInnerHTML={{__html: highlighted}}
    //                         />
    //                     </pre>
    //                 )
    //             } catch (err){
    //                 console.error(`error highlighting language "${language}":`, err);
    //             }
    //         }
    //         return (
    //             <code className="bg-gray-700 p-1 rounded" {...props}>
    //                 {codeContent}
    //             </code>
    //         )
    //     },
    // }

    // removing markdown notation for proper displaying
    // const cleanMessageContent = (message) => {

    //     return message.replace(/```markdown\n?/g, '').replace(/```/g, '');
    // }



    return (
        <div className='bg-gray-800 p-4 rounded h-full flex flex-col'>
            <div className='flex-1 overflow-y-auto mb-4'>
                {messages.length > 0 ? (messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-900 text-white' : 'bg-gray-800'}`}>
                            {msg.role === 'assistant' ? (
                                <>
                                {/* {console.log(msg.content)}
                                {console.log(cleanLatexResponse(msg.content))} */}
                                <ReactMarkdown
                                    children={cleanLatexResponse(msg.content)}
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={renderers}
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
                    </div>
                )}
                {/* <div ref={messagesEndRef}/> */}
                {isTyping && (
                    <div className='mb-2 text-left'>
                        <span className='inline-block p-2 rounded bg-gray-800 text-white'>
                            <em>...</em>
                        </span>
                    </div>
                )}
            </div>
            <div className='flex'>
                <div className='flex items-end flex-grow'>
                    <textarea
                        placeholder='Message Tutor'
                        ref={textareaRef}
                        className="flex-1 p-2 rounded-2xl bg-gray-700 resize-none"
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