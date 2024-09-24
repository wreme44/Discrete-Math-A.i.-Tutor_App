import React from 'react';
import { supabase } from './supabaseClient';

const Promotion = ({ userId, currentLevel, newLevel }) => {
  const promoteUser = async () => {
    const { data, error } = await supabase
      .from('Users')
      .update({ current_level: newLevel })
      .eq('user_id', userId);

    if (error) {
      console.log('Error promoting user:', error);
    } else {
      console.log(`User promoted from ${currentLevel} to ${newLevel}`);
    }
  };

  return (
    <div>
      <button onClick={promoteUser}>Promote to {newLevel}</button>
    </div>
  );
};

export default Promotion;
