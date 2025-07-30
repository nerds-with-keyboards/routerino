import React from "react";
import ReactDOM from "react-dom/client";
import Routerino from "routerino";
import routes from "./routes.js";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Routerino routes={routes}>
      <div className="min-h-screen bg-base-200">
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
          <div className="navbar-start">
            <a href="/" className="btn btn-ghost text-xl">
              Vite Static Example
            </a>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/features">Features</a>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            <div className="dropdown dropdown-end lg:hidden">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/features">Features</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8" id="routerino-target">
          {/* Routes will render here */}
        </main>
      </div>
    </Routerino>
  </React.StrictMode>
);
