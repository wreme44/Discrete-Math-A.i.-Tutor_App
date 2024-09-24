import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Hints = ({ exerciseId }) => {
  const [hint, setHint] = useState('');

  const fetchHint = async () => {
    const { data, error } = await supabase
      .from('Exercises')
      .select('hint')
      .eq('exercise_id', exerciseId)
      .single();

    if (error) {
      console.log('Error fetching hint:', error);
    } else {
      setHint(data.hint);
    }
  };

  return (
    <div>
      <button onClick={fetchHint}>Need a Hint?</button>
      {hint && <p>{hint}</p>}
    </div>
  );
};

export default Hints;
