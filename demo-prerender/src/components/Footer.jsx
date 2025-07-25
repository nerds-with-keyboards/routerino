import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Routerino</h3>
            <p>The lightweight React router with zero dependencies.</p>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="/docs">Documentation</a></li>
              <li><a href="/api">API Reference</a></li>
              <li><a href="/examples">Examples</a></li>
              <li><a href="https://github.com/nerds-with-keyboards/routerino">GitHub</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/nerds-with-keyboards/routerino/issues">Issues</a></li>
              <li><a href="https://github.com/nerds-with-keyboards/routerino/discussions">Discussions</a></li>
              <li><a href="https://npmjs.com/package/routerino">NPM</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Routerino. MIT License.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;