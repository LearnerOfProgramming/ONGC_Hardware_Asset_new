import React, { useState, useEffect } from 'react';

const ScrollButtons = () => {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    setShowTop(scrollTop > clientHeight / 2);
    setShowBottom(scrollTop < scrollHeight - clientHeight - clientHeight / 2);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-16 right-5 w-9 h-10 bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
        >
          <span className="text-lg font-bold">&#9650;</span> {/* Up Arrow */}
        </button>
      )}
      {showBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-5 right-5 w-9 h-10 bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors duration-200"
        >
          <span className="text-lg font-bold">&#9660;</span> {/* Down Arrow */}
        </button>
      )}
    </div>
  );
};

export default ScrollButtons;
