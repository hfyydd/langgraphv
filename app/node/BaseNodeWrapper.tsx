import React from "react";

const BaseNodeWrapper: React.FC<{
    children: React.ReactNode;
    className: string;
    isHovered: boolean;
  }> = ({ children, className, isHovered }) => (
    <div
      className={`p-2 rounded-md w-40 bg-opacity-20 text-sm text-center border transition-all duration-200 ${className} ${isHovered ? 'brightness-125' : ''
        }`}
    >
      {children}
    </div>
  );

  export default BaseNodeWrapper;