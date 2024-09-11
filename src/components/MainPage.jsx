import React from 'react';
import ChatBox from './ChatBox'

const MainPage = () => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-screen custom-3-grid">
          <div className="p-4 bg-gray-100 overflow-y-auto h-full custom-3-columns">
            <h5 className="text-xl font-bold">Lessons Instructions etc</h5>
          </div>
          <div className="p-4 bg-gray-200 overflow-y-auto h-full custom-3-columns">
            <h5 className="text-xl font-bold">LaTeX Digital Pen and Image Input</h5>
          </div>
          <div className="p-4 bg-gray-300 overflow-y-auto h-full flex flex-col custom-3-columns">
            <h5 className="text-xl font-bold">Tutor Agent with User Interactions</h5>
            <ChatBox />
          </div>
        </div>
    );
};
export default MainPage;