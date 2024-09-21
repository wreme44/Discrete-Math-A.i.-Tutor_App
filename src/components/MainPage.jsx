import React from 'react';
import ChatBox from './ChatBox'

const MainPage = () => {
    
    return (
        <div className="grid grid-cols-3 gap-4 p-4 h-screen pt-16">
            <div className="col-span-1 bg-gray-800 p-4 rounded overflow-y-auto max-h-full">
                <h5 className="text-xl font-bold">Lessons Instructions etc</h5><br/><br/>
                {/* text lessons just example testing scrolling effect */}
                <p className='mt-4 break-words'>
                    Discrete Math Overview for College Beginner Level: <br/><br/>
                    Discrete mathematics is a branch of mathematics that deals with distinct and separate values, 
                    often focusing on countable sets, such as integers or logical statements. <br/>
                    Unlike continuous math (like calculus), discrete math is foundational for fields like computer 
                    science, logic, and algorithm design. <br/><br/>

                    Key Topics in Discrete Math<br/><br/>

                    Set Theory<br/><br/>
                    Definition: A set is a collection of distinct elements.<br/>
                    Basic Operations: Union, Intersection, Difference, Complement.<br/>
                    Venn Diagrams: Visual representation of set operations.<br/>
                    Applications: Used in database systems, counting problems, etc.<br/><br/>

                    Logic and Propositional Calculus<br/><br/>
                    Logical Statements: True or false statements.<br/>
                    Connectives: AND, OR, NOT, IF-THEN, IF AND ONLY IF.<br/>
                    Truth Tables: Tabular method to analyze logical statements.<br/>
                    Applications: Circuit design, programming conditions.<br/><br/>

                    Functions and Relations<br/><br/>
                    Definition of Functions: A relation that uniquely maps elements of one set (domain) to another 
                    set (range).<br/>
                    Types of Functions: One-to-One, Onto, Inverse Functions.<br/>
                    Applications: Data mapping, algorithms.<br/><br/>

                    Counting Principles<br/><br/>
                    Permutations: Arrangement of objects in a specific order.<br/>
                    Combinations: Selection of objects without regard to order.<br/>
                    Pigeonhole Principle: If more items are placed into fewer containers, at least one container 
                    must contain more than one item.<br/>
                    Applications: Probability, cryptography, scheduling.<br/><br/>

                    Graph Theory<br/><br/>
                    Definition: A graph is a collection of nodes (vertices) connected by edges.<br/>
                    Types of Graphs: Directed, Undirected, Weighted, Trees.<br/>
                    Applications: Networking, social media connections, routing.<br/><br/>

                    Algorithms and Complexity<br/><br/>
                    Basic Concepts: Algorithms are step-by-step procedures for calculations.<br/>
                    Big-O Notation: Describes the efficiency and time complexity of algorithms.<br/>
                    Applications: Computer programming, data structure design.<br/><br/>

                    Modular Arithmetic<br/><br/>
                    Definition: Arithmetic system for integers where numbers "wrap around" after reaching a 
                    certain value (modulus).<br/>
                    Applications: Cryptography, hashing.<br/><br/>

                    Recursion and Recurrence Relations<br/><br/>
                    Recursion: A method of defining sequences or structures that refer back to themselves.<br/>
                    Recurrence Relations: Equations that recursively define sequences.<br/>
                    Applications: Algorithm design, fractals, programming.<br/><br/>

                    General Instructions for Beginners<br/><br/>
                    Understand Definitions: Ensure you're clear on the basic definitions for each topic. 
                    Discrete math involves a lot of definitions and terminology.<br/><br/>

                    Practice Problem Solving: Regularly solve problems involving set theory, counting, logic, 
                    and graphs. Practice makes it easier to apply concepts in computer science or programming later on.<br/><br/>

                    Use Visual Aids: For topics like set theory, logic, and graph theory, 
                    visual tools (Venn diagrams, truth tables, graph sketches) help build intuition.<br/><br/>

                    Explore Applications: Discrete math is highly applicable in computer science, algorithms, 
                    cryptography, and data analysis. Understanding these connections can make learning more interesting.<br/><br/>

                    Study Proof Techniques: Discrete math often involves proving statements 
                    (like mathematical induction or direct proof). Start practicing simple proofs to get 
                    comfortable with logical reasoning.<br/><br/>

                    Engage with Peers: Discrete math problems can sometimes be tricky. 
                    Discussing problems and solutions with classmates can help you understand different approaches.<br/><br/>

                    This general structure provides a foundation for your journey into discrete mathematics!
                </p>
            </div>
            <div className="col-span-1 bg-gray-800 p-4 rounded overflow-y-auto max-h-full">
                <h5 className="text-xl font-bold">LaTeX Image Input</h5><br/><br/>
                {/* latex parser just example testing scrolling effect */}
                <p className="break-words">
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