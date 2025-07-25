import React from 'react';

const Header = () => {
  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-container">
          <a href="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 16L14 20L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Routerino</span>
          </a>
          <ul className="nav-links">
            <li><a href="/features">Features</a></li>
            <li><a href="/docs">Docs</a></li>
            <li><a href="/examples">Examples</a></li>
            <li><a href="/api">API</a></li>
            <li>
              <a href="https://github.com/nerds-with-keyboards/routerino" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="github-link">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;