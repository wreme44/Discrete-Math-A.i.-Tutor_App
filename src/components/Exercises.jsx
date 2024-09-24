import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const Exercises = ({ difficultyLevel }) => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const { data, error } = await supabase
        .from('Exercises')
        .select('*')
        .eq('difficulty_level', difficultyLevel);

      if (error) {
        console.log('Error fetching exercises:', error);
      } else {
        setExercises(data);
      }
    };

    fetchExercises();
  }, [difficultyLevel]);

  return (
    <div>
      <h2>Exercises for {difficultyLevel} Level</h2>
      <ul>
        {exercises.map(ex => (
          <li key={ex.exercise_id}>
            {ex.exercise_desc}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Exercises;
