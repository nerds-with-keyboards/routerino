import React from "react";

const Footer = () => {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content">
      <div className="max-w-7xl mx-auto w-full">
        <div className="footer justify-between">
          <div>
            <span className="footer-title">Routerino</span>
            <p className="max-w-xs">
              The lightweight React router with zero dependencies.
            </p>
          </div>
          <div>
            <span className="footer-title">Resources</span>
            <a href="/docs" className="link link-hover">
              Documentation
            </a>
            <a href="/api" className="link link-hover">
              API Reference
            </a>
            <a href="/examples" className="link link-hover">
              Examples
            </a>
            <a
              href="https://github.com/nerds-with-keyboards/routerino"
              className="link link-hover"
            >
              GitHub
            </a>
          </div>
          <div>
            <span className="footer-title">Community</span>
            <a
              href="https://github.com/nerds-with-keyboards/routerino/issues"
              className="link link-hover"
            >
              Issues
            </a>
            <a
              href="https://github.com/nerds-with-keyboards/routerino/discussions"
              className="link link-hover"
            >
              Discussions
            </a>
            <a
              href="https://npmjs.com/package/routerino"
              className="link link-hover"
            >
              NPM
            </a>
          </div>
        </div>
        <div className="border-t border-base-300 mt-8 pt-8 text-center">
          <p>&copy; 2024 Routerino. MIT License.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
