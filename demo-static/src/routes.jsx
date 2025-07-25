import React from 'react';
import Home from './pages/Home.jsx';
import Features from './pages/Features.jsx';
import Docs from './pages/Docs.jsx';
import Examples from './pages/Examples.jsx';
import API from './pages/API.jsx';

const routes = [
  {
    path: '/',
    element: <Home />,
    title: 'Lightweight React Router',
    description: 'A zero-dependency React router with built-in SEO optimization, prerendering support, and static site generation.',
    tags: [
      { property: 'og:url', content: 'https://routerino.dev/' }
    ]
  },
  {
    path: '/features',
    element: <Features />,
    title: 'Features',
    description: 'Explore the powerful features of Routerino including SEO optimization, prerendering, static generation, and more.',
    tags: [
      { property: 'og:url', content: 'https://routerino.dev/features' }
    ]
  },
  {
    path: '/docs',
    element: <Docs />,
    title: 'Documentation',
    description: 'Get started with Routerino. Learn how to install, configure, and use the lightweight React router in your projects.',
    tags: [
      { property: 'og:url', content: 'https://routerino.dev/docs' }
    ]
  },
  {
    path: '/examples',
    element: <Examples />,
    title: 'Examples',
    description: 'See Routerino in action with real-world examples and code snippets.',
    tags: [
      { property: 'og:url', content: 'https://routerino.dev/examples' }
    ]
  },
  {
    path: '/api',
    element: <API />,
    title: 'API Reference',
    description: 'Complete API reference for Routerino components, props, and utilities.',
    tags: [
      { property: 'og:url', content: 'https://routerino.dev/api' }
    ]
  }
];

export default routes;