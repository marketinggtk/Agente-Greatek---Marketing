import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      {...props}
      className={`
        flex items-center justify-center shrink-0
        bg-greatek-blue text-white
        hover:bg-greatek-dark-blue
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-greatek-blue/50 focus:ring-offset-1
        ${className}
      `}
    >
      {children}
    </button>
  );
};
