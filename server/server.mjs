import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';
import { Stream } from 'openai/streaming.mjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// SSE server sent events
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
              messages: [
                { role: 'system', content: 'You are a Discrete Math tutor assistant who guides students to a correct understanding of Discrete Math.' },
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
                .filter((line) => line.trim() !== '');
            
            for (const line of lines) {

                if (line.startsWith('data: ')) {
                    // closing sse connection via [DONE]
                    const data = line.replace('data: ', '');
                    console.log('Processing data:', data);
                    if (data == '[DONE]') {

                        res.write('data: [DONE]\n\n');
                        res.end();
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const text = parsed.choices[0].delta.content || '';
                        res.write(`data: ${JSON.stringify({content: text})}\n\n`);
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
            // res.status(500).json({error: 'Error streaming repsonse from chatGpt api'});
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