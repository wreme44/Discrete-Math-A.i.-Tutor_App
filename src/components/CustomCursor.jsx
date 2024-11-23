import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '24px',
          height: '24px',
        //   backgroundImage: `url('/wand-cursor.png')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          pointerEvents: 'none', // Ensures it doesn't block mouse events
          transform: 'translate(-50%, -50%)', // Centers the cursor
          zIndex: 9999,
        }}
      />
      {isClicked && (
        <div
          style={{
            position: 'absolute',
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: '50px',
            height: '50px',
            // background: 'radial-gradient(circle, rgba(255,255,0,1) 0%, rgba(255,0,0,0) 70%)',
            background: 'radial-gradient(circle, rgba(255,255,0,1) 20%, rgba(255,0,0,0.5) 50%, rgba(255,0,0,0) 70%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'spark-animation 0.5s ease-out',
            pointerEvents: 'none',
          }}
        />
      )}
      <style>
        {`
          @keyframes spark-animation {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(2);
            }
          }
        `}
      </style>
    </>
  );
};

export default CustomCursor;
