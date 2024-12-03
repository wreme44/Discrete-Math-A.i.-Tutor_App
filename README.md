# Web Development Project - *DiscreteMentor*

## Live Application

The application is deployed and can be accessed at [Live Application](https://discrete-mentor-16b9a1c9e019.herokuapp.com/).

This web app: 

**DiscreteMentor is an AI-powered tutor designed to assist students in understanding and solving discrete mathematics problems. The app combines interactivity, accessibility, and advanced validation capabilities to provide a comprehensive learning experience. The main features of the application include:**  
  
**Interactive Lessons:** *Users can access lessons on discrete math topics and follow along with step-by-step explanations.*  
  
**Flexible Input Options:** *Users can input solutions in various formats, including LaTeX, image uploads, or digital pen drawings, making the app accessible to diverse problem-solving preferences.*  
  
**Image Upload for Solutions:** *This feature allows users to upload images containing their solutions—such as handwritten math problems, diagrams, or graphs—which are processed and validated by the GPT API. It enhances accessibility and provides flexibility for solving problems in different formats.*  
  
**AI Tutor Assistance:** *The AI tutor provides guidance and feedback, ensuring users stay on topic and focus on discrete math concepts.*  
  
**Solutions Validation:** *The AI Tutor Agent validates solutions and provides hints or corrections where needed, ensuring users stay on topic and focus on discrete math.*  
  
**Gamification:** *Mini math games are included to make learning more engaging and reinforce discrete math concepts through practice in a fun, interactive way.*  
  
**User Interface:** *The app's responsive design features a 3-column layout for lessons, input, and AI interaction, built with React, Vite, and Tailwind CSS.*  
  
## Features

- [X] **Access to a variety of discrete math lessons and problems**
- [X] **Ability to input problems via LaTeX, image upload, or digital pen input**  
- [X] **Image Upload Capability: Users can upload images as potential solutions, which are validated by the GPT API**
- [X] **Interactive chat interface for AI tutor responses and guidance**
- [X] **Solution validation and error checking by the Math Validator Agent**
- [X] **Gamification with mini math games for practice and engagement**
- [X] **Skill tracking to monitor user progress**
- [X] **Responsive UI using a 3-column layout: lesson instructions, input area, and AI tutor response**
- [X] **Real-time API integration with OpenAI for advanced natural language processing and feedback**
  
## Tech Stack

**Frontend**:  
- React, Tailwind CSS, Vite  
- LaTeX Rendering: rehype-katex with custom processing functions for accurate LaTeX parsing and rendering  
- Image Upload Interface: Allows users to upload images for solution validation  
  
**Backend**:  
- Node.js, Express.js, Axios  
- Image Processing Integration: Sends uploaded and digitally drawn images to GPT API for validation  
  
**API**: OpenAI ChatGPT API, Supabase API  
  
**Other**:  
- Virtual Math Keyboard (MathLive): Enables interactive input of math symbols and equations  
- Digital Drawing Tool (Excalidraw): Allows graphical and handwritten input for math solutions, supporting mouse and pen devices  
- Skill Tracking Database: Tracks and displays user progress on completed lessons and exercises  

## Video Walkthrough

![Video Walkthrough](./public/demo10.gif)
![Video Walkthrough](./public/demo9.gif)
![Video Walkthrough](./public/demo8.gif)
![Video Walkthrough](./public/demo7.gif) 
![Video Walkthrough](./public/demo6.gif)  
![Video Walkthrough](./public/demo5.gif)  
![Video Walkthrough](./public/demo4.gif)  
![Video Walkthrough](./public/demo3.gif)  
![Video Walkthrough](./public/demo2.gif)  
![Video Walkthrough](./public/demo1.gif)  

## License

    All rights reserved.
