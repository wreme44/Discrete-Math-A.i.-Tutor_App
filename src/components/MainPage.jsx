import React from 'react';
import ChatBox from './ChatBox'
import LessonsColumn from './LessonsColumn';

const MainPage = () => {
    
    return (
        <div className="grid grid-cols-3 gap-4 p-4 h-screen pt-16">
            <div className="col-span-1 bg-gray-800 p-4 rounded overflow-y-auto max-h-full">
                <LessonsColumn />
            </div>
            <div className="col-span-1 bg-gray-800 p-4 rounded overflow-y-auto max-h-full">
                <h5 className="text-xl font">LaTeX Image Input</h5><br/><br/>
                {/* latex parser just example testing scrolling effect */}
                <p>
                    A LaTeX parser is a software tool or component that interprets and processes LaTeX code, 
                    which is a typesetting system widely used for creating mathematical and scientific documents. 
                    The parser reads LaTeX code and converts it into a structured format, such as a formatted document 
                    or a digital display, like a PDF or HTML.<br/><br/>

                    Use in Discrete Math:<br/><br/>
                    In discrete mathematics, LaTeX is often used to write complex mathematical symbols, equations, 
                    proofs, and logical statements in a clear and professional manner. <br/>A LaTeX parser ensures that these 
                    mathematical expressions are correctly formatted and displayed, which is especially helpful for:<br/><br/>

                    -Writing proofs (induction, direct, etc.)<br/>
                    -Displaying set notation, logic expressions, and graph theory visuals<br/>
                    -Creating formal documentation for assignments and papers<br/>
                    -In essence, a LaTeX parser is used to turn LaTeX code into readable and well-structured documents 
                    that are critical in presenting formal mathematical work.<br/>
                </p>
            </div>
            <div className="col-span-1 rounded overflow-y-auto max-h-full">
              <ChatBox />
            </div>
          </div>
      );
}

export default MainPage;


    // return (
    //     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-screen custom-3-grid">
    //       <div className="p-4 bg-gray-100 overflow-y-auto h-full custom-3-columns">
    //         <h5 className="text-xl font-bold">Lessons Instructions etc</h5>
    //       </div>
    //       <div className="p-4 bg-gray-200 overflow-y-auto h-full custom-3-columns">
    //         <h5 className="text-xl font-bold">LaTeX Digital Pen and Image Input</h5>
    //       </div>
    //       <div className="p-4 bg-gray-300 overflow-y-auto h-full flex flex-col custom-3-columns">
    //         <h5 className="text-xl font-bold">Tutor Agent with User Interactions</h5>
    //         <ChatBox />
    //       </div>
    //     </div>
    // );