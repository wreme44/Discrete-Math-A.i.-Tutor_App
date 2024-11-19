import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const rootDir = path.resolve(__dirname, '..');

// middlewares
// app.use(express.static(path.join(rootDir, 'dist')));
// app.use(express.static(path.join(__dirname, 'dist')));

app.use(cors());
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb', extended: true}));

// app.get('*', (req, res) => {
//     res.sendFile(path.join(rootDir, 'dist', 'index.html'));
// });

// making sure each chunk is a complete json object
const isValidJSON = (str) => {

    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

// handling image file uploads
// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: {fileSize: 10000000}, // 10 MB limit
//     fileFilter: function (req, file, cb) {
//         const filetypes = /jpeg|jpg|png|gif/;
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//         const mimetype = filetypes.test(file.mimetype);

//         if (mimetype && extname) {
//             return cb(null, true);
//         } else {
//             cb('Only images are allowed.');
//         }
//     }
// });

// SSE server sent events
// handles streaming responses from ChatGPT API, forwards them to client
app.post('/api/chat', async (req, res) => {

    const { messages } = req.body;

    res.setHeader('Content-Type', 'text/event-stream'); // establishing sse connection
    res.setHeader('Cache-Control', 'no-cache'); // disabling caching
    res.setHeader('Connection', 'keep-alive'); // continuous streaming
    res.flushHeaders(); // flushing headers establishing sse with client frontend
    // buffer to accumulate the chunks, to make sure each chunk is complete json before sending to frontend
    let buffer = '';

    try {
        const response = await axios({
            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            data: {
                model: 'gpt-4o',
                messages: [ // pre prompting gpt
                    {
                        role: 'system', content: 'You are a Discrete Math tutor assistant. Your role is to guide students to a correct understanding of Discrete Math through interactive learning.' +

                            'When a student asks for help, do the following: ' +
                            '1. Start by guiding the student through the problem with hints, questions, or explanations that encourage them to think critically about the solution.' +
                            '2. Avoid giving the full solution immediately. Instead, break down the problem into smaller steps and provide hints or explain key concepts relevant to the problem.' +
                            '3. If the student struggles after receiving hints, offer more detailed guidance or clarification without revealing the full answer.' +
                            '4. Only provide the full solution after the student has made an effort to understand or explicitly asks for the solution.' +
                            '5. When giving the full solution, provide a clear and detailed explanation, ensuring the student understands each step.' +
                            'Your goal is to foster learning by helping students build their own problem-solving skills, not just providing answers.' +

                            'Additionally: ' +
                            '- Stick to topics related to Discrete Math, general math, or computer science.' +
                            '- Do not discuss or provide information on topics that are unrelated to math, computer science, or Discrete Math concepts.' +

                            'When sending LaTeX content, always follow these rules:' +
                            '- Always wrap both display math (block-level math) and inline math with double dollar signs ($$ ... $$).' +
                            '- Never wrap LaTeX equations with backticks, backslash brackets (\\[ ... \\]), or backslash parentheses (\\( ... \\)).' +
                            '- Make sure that all LaTeX content is consistently wrapped using only double dollar signs ($$ ... $$).'
                    },
                    ...messages,
                ],
                stream: true, // enabling streaming (repsonse displays in real time)
            },
            responseType: 'stream',
        });
        // real time streaming messages, in chunks, each is parsed, content extracted + sent to client via sse
        response.data.on('data', (chunk) => {

            // console.log('Received chunk from OpenAI:', chunk.toString());
            buffer += chunk.toString();

            const lines = buffer
                .split('\n')
                .filter(line => line.trim() !== '');

            for (const line of lines) {

                if (line.startsWith('data: ')) {
                    // closing sse connection via [DONE]
                    const data = line.replace('data: ', '');
                    // console.log('Processing data:', data);
                    if (data == '[DONE]') {

                        res.write('data: [DONE]\n\n');
                        res.end();
                        return;
                    }
                    try {
                        if (isValidJSON(data)) {

                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                                // res.write('\n');
                            }
                        }
                        buffer = ''; // clearing buffer after parsing, for next chunk
                    } catch (error) {
                        console.error('Error parsing sse data:', error);
                    }
                }
            }
        })
        response.data.on('end', () => {
            res.end();
        })
        response.data.on('error', (error) => {

            console.error('stream error:', error);
            res.write('data: {"error": "Error streaming repsonse from chatGpt api"}\n\n');
            res.end();
        })
        // res.json({ message: response.data.choices[0].message });
    } catch (error) {

        console.error('Error fetching API:', error);
        res.status(500).json({ error: 'Error fetching API' });
    }
});

// construct promptContent
const buildPromptContent = ({ exerciseQuestion, correctAnswer, userSolution, image }) => {
    let content = [
        {type: 'text', text: `Problem: ${exerciseQuestion}`}, 
        {type: 'text', text: `\nCorrect Answer: ${correctAnswer}`}, 

    ];

    if (userSolution) {
        content.push({type: 'text', text: `Student's Solution: ${userSolution}.`});
        content.push({type: 'text', text: `\nCompare the student's solution with the Correct Answer that is given and return the "correct" field as true or false. 
            Provide feedback in the form of short hints or step-by-step guidance. If the solution is incorrect, do not reveal the correct answer.
            \nIgnore whether the student wrote their answer in correct LaTeX format or not. Only verify the correctness of the solution.
            \nAdditionaly when sending LaTeX content, always follow these rules:
            - Always wrap both display math (block-level math) and inline math with double dollar signs ($$ ... $$).
            - Never wrap LaTeX equations with backticks, backslash brackets (\\[ ... \\]), or backslash parentheses (\\( ... \\)).
            - Make sure that all LaTeX content is consistently wrapped using only double dollar signs ($$ ... $$).`})
    }
    if (image) {
        content.push({type: 'image_url', image_url: {url: image}});
        content.push({type: 'text', text: `\nThe student's solution has been provided as an image. Compare the image solution with the provided Correct Answer.
            Return the "correct" field as true or false. Provide feedback in the form of short hints or step-by-step guidance. 
            If the image solution is incorrect, do not reveal the correct answer.
            Ensure that the content in the image solution is directly related to the exercise question provided. 
            If the content of the image solution does not match or address the exercise question, consider it a false solution, and do not evaluate it further. 
            Instead, respond with a message indicating that the image solution does not relate to the question.
            \nAdditionaly when sending LaTeX content, always follow these rules:
            - Always wrap both display math (block-level math) and inline math with double dollar signs ($$ ... $$).
            - Never wrap LaTeX equations with backticks, backslash brackets (\\[ ... \\]), or backslash parentheses (\\( ... \\)).
            - Make sure that all LaTeX content is consistently wrapped using only double dollar signs ($$ ... $$).`})
    }

    return content;
};

// handles VALIDATION of user solution with image, using ChatGpt api
app.post('/api/validate-solution', async (req, res) => {
    // Log the incoming request
    // console.log("Received request body:", req.body);
    const {messages} = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid messages format.' });
    }

    // extract essential parts
    const exerciseQuestion = messages.find(m => m.type === "text" && m.text.startsWith("Exercise Question:"))?.text.replace("Exercise Question: ", "").trim();
    const correctAnswer = messages.find(m => m.type === "text" && m.text.startsWith("Correct Answer:"))?.text.replace("Correct Answer: ", "").trim();
    const userSolution = messages.find(m => m.type === "text" && m.text.startsWith("User solution:"))?.text.replace("User solution: ", "").trim();
    const image = messages.find(m => m.type === "image_url")?.image_url;

    if (!exerciseQuestion || !correctAnswer) {
        return res.status(400).json({error: 'Exercise question or correct answer missing.'});
    }
    if (!userSolution && !image) {
        return res.status(400).json({error: 'No solution provided.'});
    }

    const promptContentArray = buildPromptContent({ exerciseQuestion, correctAnswer, userSolution, image });
    // console.log('Prompt Content:', promptContentArray);

    const openAIMessages = [
        {
            role: 'system',
                content: `You are a Discrete Math tutor. You will be given a math problem, the student's solution, and the Correct Answer. 
                        You may receive the student's solution as either text or an image or both.
 
                        1. Compare the student's text solution (if provided) and / or the image solution (if provided) with the Correct Answer, and determine if it's correct. 
                        2. Always return a response in valid JSON format with {"correct": true/false, "feedback": "feedback on the solution"}.
                        Do not return plain text responses unless explicitly instructed otherwise.
                        When sending the JSON response, do not wrap it in triple backticks. Simply return valid JSON without any markdown or code block formatting. 
                        3. If the solution is incorrect, give feedback but do not reveal the correct answer.
                        If the content in the image solution is not directly related to the exercise question provided, consider it a false solution, and do not evaluate it further. 
                        Instead, respond with a message indicating that the image solution does not relate to the question.`

                        // Additionaly when sending LaTeX content, always follow these rules:' +
                        // - Always wrap both display math (block-level math) and inline math with double dollar signs ($$ ... $$).
                        // - Never wrap LaTeX equations with backticks, backslash brackets (\\[ ... \\]), or backslash parentheses (\\( ... \\)).
                        // - Make sure that all LaTeX content is consistently wrapped using only double dollar signs ($$ ... $$).
            },
            {
                role: 'user',
                content: promptContentArray,
            },
    ];
    const data = {
        model: 'gpt-4o', 
        messages: openAIMessages,
        max_tokens: 500 
    };
    try {    
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const result = response.data.choices[0].message.content;
        // logging raw result to check format
        // console.log('Raw GPT response:', result);

        // step 1: remove triple backticks (```) if any
        let sanitizedResult = result.replace(/```/g, '');

        // step 2: detect and remove latex $ sign wrappers
        const latexRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
        // detect raw latex
        const rawLatexRegex = /\\(frac|sum|int|left|right|cdots|dots|binom|sqrt|text|over|begin|end|matrix|neg|land|lor|to|times|infty|leq|geq|neq|approx|forall|exists|subseteq|supseteq|cup|cap|nabla|partial|alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|not|[A-Za-z]+)\b/g; 

        // check if latex is present (wrapped or raw)
        const hasLatex = latexRegex.test(sanitizedResult);
        const hasRawLatex = rawLatexRegex.test(sanitizedResult);

        if (hasLatex || hasRawLatex) {
            // step 3: remove $ signs around latex expressions
            sanitizedResult = sanitizedResult.replace(/\$\$/g, '').replace(/\$/g, '');
        }
        // step 4: escape backslashes for valid json
        const escapedResult = sanitizedResult.replace(/\\/g, '\\\\');
        // console.log('Escaped GPT response (before JSON parsing):', escapedResult);

        // step 5: try to parse escaped result
        if (escapedResult.trim().startsWith('{') && escapedResult.trim().endsWith('}')) {

            let jsonResponse = JSON.parse(escapedResult);
            // step 6: remove extra backslashes in latex
            jsonResponse.feedback = jsonResponse.feedback.replace(/\\\\/g, '\\');  // restore single backslashes
            // console.log('Non-escaped GPT response (AFTER JSON parsing):', jsonResponse);
            // step 7: return cleaned up response as json
            res.json(jsonResponse);
        } else {
            console.error('Non-JSON response', sanitizedResult)
            res.json({error: 'GPT returned a non-JSON response', details: sanitizedResult})
        }
    } catch (error) {
        if (error.response) {
            // OpenAI API responded with an error
            console.error('OpenAI API Error:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            // No response received from OpenAI
            console.error('No response from OpenAI:', error.request);
            res.status(500).json({ error: 'No response from OpenAI' });
        } else {
            // Other errors
            console.error('Error:', error.message);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});