export default [
  {
    path: '/',
    element: null, // Element not needed for static generation
    title: 'Home - My Website',
    description: 'Welcome to my awesome website built with Routerino',
    tags: [
      { property: 'og:site_name', content: 'My Website' }
    ]
  },
  {
    path: '/about',
    element: null,
    title: 'About Us - My Website',
    description: 'Learn more about our company and mission',
    imageUrl: 'https://example.com/about-og-image.jpg'
  },
  {
    path: '/blog',
    element: null,
    title: 'Blog - My Website',
    description: 'Read our latest articles and insights'
  },
  {
    path: '/blog/:slug',
    element: null,
    title: 'Blog Post',
    description: 'Dynamic route - will be skipped in static generation'
  },
  {
    path: '/contact',
    element: null,
    title: 'Contact Us - My Website',
    description: 'Get in touch with our team',
    tags: [
      { name: 'robots', content: 'index,follow' }
    ]
  }
];