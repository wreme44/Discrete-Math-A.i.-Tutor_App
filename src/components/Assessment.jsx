import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ensure correct import path for Supabase client
import { useNavigate } from 'react-router-dom';

const Assessment = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [errorMsg, setErrorMsg] = useState(''); // Error message state
  const [skipAssessment, setSkipAssessment] = useState(false); // Skip assessment state
  const [currentQuestion, setCurrentQuestion] = useState(0); // Current question index
  const [userAnswer, setUserAnswer] = useState(''); // User's answer to the current question
  const [score, setScore] = useState(0); // Track the user's score
  const navigate = useNavigate();

  // Function to handle skipping the assessment
  const handleSkip = () => {
    setSkipAssessment(true);
    // Directly update the user level to "Beginner" in the database (you may modify this based on your DB schema)
    const updateUserLevel = async () => {
      const user = supabase.auth.user(); // Get the currently logged-in user
      if (user) {
        const { error } = await supabase
          .from('Users')
          .update({ current_level: 'beginner' }) // Assuming 'current_level' is the column name
          .eq('user_id', user.id);
        if (error) {
          console.error('Error updating user level:', error);
        }
      }
    };
    updateUserLevel();
    navigate('/myProfile'); // Redirect user to their profile or lessons page after skipping
  };

  // Fetching the assessment questions from Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('AssessmentQuestions').select('*');
      if (error) {
        setErrorMsg('Failed to load questions. Please try again.');
      } else {
        setQuestions(data);
      }
      setLoading(false); // Turn off loading after fetching questions
    };
    fetchQuestions();
  }, []);

  // Handle the answer submission
  const handleSubmitAnswer = () => {
    // You can check the answer here and update the score
    if (questions[currentQuestion].answer.toLowerCase() === userAnswer.toLowerCase()) {
      setScore(score + 1); // Increment score if the answer is correct
    }

    // Move to the next question or end the assessment
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer(''); // Clear the answer field for the next question
    } else {
      // Assessment finished, evaluate the final score and determine the user's level
      evaluateScore();
    }
  };

  // Function to evaluate the score and update the user's level
  const evaluateScore = async () => {
    const user = supabase.auth.user();
    if (user) {
      let newLevel = 'beginner';
      if (score >= 7) {
        newLevel = 'intermediate';
      } else if (score >= 12) {
        newLevel = 'advanced';
      } else if (score >= 16) {
        newLevel = 'expert';
      }

      const { error } = await supabase
        .from('Users')
        .update({ current_level: newLevel })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user level:', error);
      } else {
        // Redirect user to their profile or lessons page
        navigate('/myProfile');
      }
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (errorMsg) return <p>{errorMsg}</p>;

  // If user skips the assessment, display the beginner level info
  if (skipAssessment) {
    return <p>Starting you at Beginner level...</p>;
  }

  return (
    <div className="assessment-container">
      <button onClick={handleSkip} className="px-4 py-2 bg-blue-600 text-white rounded">
        Skip Assessment and Start as Beginner
      </button>
      <div className="question-section mt-4">
        <h3>Question {currentQuestion + 1} of {questions.length}</h3>
        <p>{questions[currentQuestion]?.question}</p>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmitAnswer}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default Assessment;
