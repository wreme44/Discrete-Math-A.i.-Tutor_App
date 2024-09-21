import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
// import { Stream } from 'openai/streaming.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// SSE server sent events
// handles streaming responses from Gpt Api, forwards them to client
app.post('/api/chat', async (req, res) => {

    const { messages } = req.body;

    res.setHeader('Content-Type', 'text/event-stream'); // establishing sse connection
    res.setHeader('Cache-Control', 'no-cache'); // disabling caching
    res.setHeader('Connection', 'keep-alive'); // continuous streaming
    res.flushHeaders(); // flushing headers establishing sse with client frontend

    try {

        const response = await axios({

            method: 'post',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            data: {
              model: 'gpt-4',
              messages: [ // pre prompting gpt
                { role: 'system', content: 'You are a Discrete Math tutor assistant. Your role is to guide students to a correct understanding of Discrete Math through interactive learning. ' +

                    'When a student asks for help, do the following: ' +
                    '1. Start by guiding the student through the problem with hints, questions, or explanations that encourage them to think critically about the solution. ' +
                    '2. Avoid giving the full solution immediately. Instead, break down the problem into smaller steps and provide hints or explain key concepts relevant to the problem. ' +
                    '3. If the student struggles after receiving hints, offer more detailed guidance or clarification without revealing the full answer. ' +
                    '4. Only provide the full solution after the student has made an effort to understand or explicitly asks for the solution. ' +
                    '5. When giving the full solution, provide a clear and detailed explanation, ensuring the student understands each step. ' +
                    'Your goal is to foster learning by helping students build their own problem-solving skills, not just providing answers. ' +

                    'Additionally: ' +
                    '- Stick to topics related to Discrete Math, general math, or computer science. ' +
                    '- Do not discuss or provide information on topics that are unrelated to math, computer science, or Discrete Math concepts. ' +

                    'When sending LaTeX equations, please adhere to the following rules: ' +
                    '1. Use `$$ $$` for display math (block-level math) and `$ $` for inline math. Avoid using `\[ \]` or `\( \)`. ' +
                    '2. Remove any unnecessary line breaks or spaces inside LaTeX delimiters. ' +
                    '3. Ensure that subscript (e.g., `x_{1}`) and superscript (e.g., `x^{2}`) are correctly formatted without extra spaces. ' +
                    '4. For factorials and ellipsis, use standard LaTeX symbols like `n!` and `\cdots`. ' +
                    '5. Avoid including extra markdown backticks (` ``` `) in LaTeX blocks. ' +
                    '6. For powers and exponents, always use the `^` symbol. For example, for squared terms, use `b^2` rather than just `b2` ' +
                    '7. For ellipses, use the correct LaTeX command `\cdots` for centered ellipses and `\ldots` for lower ellipses. ' +
                    '8. Provide clean LaTeX that can be easily interpreted by LaTeX rendering engines. ' +
                    'For example: ' +
                    'Display math: ' +
                    '$$ \lim_{x \to a} f(x) $$' +
                    'Inline math: ' +
                    '$ x_{1} + x^{2} $' +
                    'Factorials: ' +
                    '$$ n! = n \times (n-1) \times \cdots \times 1 $$' +
                    'Quadratic equation: ' +
                    '$$ x = \frac{-b \pm \sqrt{b^2-4ac}}{2a} $$' +
                    ' Please ensure all equations are formatted accordingly.' 
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

            const lines = chunk
                .toString()
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
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        if (content) {
                            res.write(`data: ${JSON.stringify({content})}\n\n`);
                            res.write('\n');
                        }
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});