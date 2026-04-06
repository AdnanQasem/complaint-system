import React from 'react';

const Logo = ({ size = 40, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    <rect width="100" height="100" rx="24" fill="url(#brandGradient)" />
    {/* Chat Bubble Icon */}
    <path 
      d="M50 26C35.0883 26 23 36.5772 23 49.625C23 56.8727 26.7495 63.3634 32.7423 67.6157C32.0471 72.0125 28.9502 76.0122 28.6405 76.3986C28.1217 77.0463 28.7758 77.9298 29.5532 77.6335C35.0664 75.5262 39.4526 72.3245 42.0838 70.1442C44.5752 70.7892 47.2372 71.1562 50 71.1562C64.9117 71.1562 77 60.579 77 47.5312C77 34.4835 64.9117 26 50 26Z" 
      fill="white" 
    />
    {/* Three dots symbolizing a complaint/typing */}
    <circle cx="37" cy="48" r="5" fill="#1D70B8" />
    <circle cx="50" cy="48" r="5" fill="#1D70B8" />
    <circle cx="63" cy="48" r="5" fill="#1D70B8" />
    {/* Shield Check Overlay */}
    <path d="M72 65C72 74 65 79 65 79C65 79 58 74 58 65V57L65 54L72 57V65Z" fill="#F59E0B" />
    <path d="M62 66L64.5 68.5L68.5 62.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    
    <defs>
      <linearGradient id="brandGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#112E51" />
        <stop offset="1" stopColor="#1D70B8" />
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
