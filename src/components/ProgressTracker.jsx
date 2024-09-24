import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProgressTracker = ({ userId, skillId, exerciseId }) => {
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);

  const updateProgress = async () => {
    const { data, error } = await supabase
      .from('Progress')
      .upsert({
        user_id: userId,
        skill_id: skillId,
        exercise_id: exerciseId,
        attempts,
        score
      });

    if (error) {
      console.log('Error updating progress:', error);
    } else {
      console.log('Progress updated:', data);
    }
  };

  useEffect(() => {
    // You could fetch initial progress here and populate state (attempts/score)
  }, [userId, skillId, exerciseId]);

  return (
    <div>
      <h3>Track your progress:</h3>
      <p>Attempts: {attempts}</p>
      <p>Score: {score}</p>
      <button onClick={updateProgress}>Update Progress</button>
    </div>
  );
};

export default ProgressTracker;
