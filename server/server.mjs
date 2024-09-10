import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a Discrete Math tutor assistant who guides students to a correct understanding of Discrete Math.' },
        ...messages,
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    res.json({ message: response.data.choices[0].message });
  } catch (error) {
    console.error('Error fetching API:', error);
    res.status(500).json({ error: 'Error fetching API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});