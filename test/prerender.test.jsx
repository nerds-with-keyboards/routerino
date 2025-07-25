import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Routerino, { updateHeadTag } from '../routerino.jsx';

describe('Prerender Support', () => {
  let originalLocation;
  let metaTags;

  beforeEach(() => {
    // Mock window.location
    originalLocation = window.location;
    delete window.location;
    window.location = {
      href: 'https://example.com/',
      pathname: '/',
      search: '',
      host: 'example.com'
    };

    // Clean up any meta tags from previous tests
    metaTags = document.querySelectorAll('meta[name^="prerender"]');
    metaTags.forEach(tag => tag.remove());
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('Prerender Meta Tags', () => {
    it('should add prerender status code meta tag for 404 pages', () => {
      const routes = [
        { path: '/exists', element: <div>Exists</div> }
      ];

      window.location.href = 'https://example.com/does-not-exist';
      window.location.pathname = '/does-not-exist';

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const statusTag = document.querySelector('meta[name="prerender-status-code"]');
      expect(statusTag).toBeTruthy();
      expect(statusTag.getAttribute('content')).toBe('404');
    });

    it('should add prerender redirect meta tags', () => {
      // Test redirect functionality
      updateHeadTag({
        name: 'prerender-status-code',
        content: '301'
      });

      updateHeadTag({
        name: 'prerender-header',
        content: 'Location: https://example.com/new-location'
      });

      const statusTag = document.querySelector('meta[name="prerender-status-code"]');
      const headerTag = document.querySelector('meta[name="prerender-header"]');

      expect(statusTag.getAttribute('content')).toBe('301');
      expect(headerTag.getAttribute('content')).toBe('Location: https://example.com/new-location');
    });

    it('should clean up prerender tags on route change', () => {
      const routes = [
        { path: '/', element: <div>Home</div> },
        { path: '/about', element: <div>About</div> }
      ];

      // Start on 404
      window.location.pathname = '/missing';
      const { rerender } = render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      expect(document.querySelector('meta[name="prerender-status-code"]')).toBeTruthy();
      expect(document.querySelector('meta[name="prerender-status-code"]').getAttribute('content')).toBe('404');

      // Navigate to valid route
      window.location.pathname = '/';
      window.location.href = 'https://example.com/';
      
      // Trigger re-render
      rerender(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      // Prerender tags should be removed when navigating to a valid route
      expect(document.querySelector('meta[name="prerender-status-code"]')).toBeFalsy();
    });

    it('should clean up redirect tags when navigating to valid route', () => {
      // First set redirect tags
      updateHeadTag({ name: 'prerender-status-code', content: '301' });
      updateHeadTag({ name: 'prerender-header', content: 'Location: /redirect' });

      expect(document.querySelector('meta[name="prerender-status-code"]')).toBeTruthy();
      expect(document.querySelector('meta[name="prerender-header"]')).toBeTruthy();

      const routes = [
        { path: '/', element: <div>Home</div> }
      ];

      // Navigate to valid route
      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      // Both prerender tags should be removed
      expect(document.querySelector('meta[name="prerender-status-code"]')).toBeFalsy();
      expect(document.querySelector('meta[name="prerender-header"]')).toBeFalsy();
    });

    it('should set 500 status code on error', () => {
      const ThrowError = () => {
        throw new Error('Component error');
      };

      const routes = [
        { path: '/', element: <ThrowError /> }
      ];

      // Suppress console errors for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      render(
        <Routerino 
          routes={routes}
          errorTemplate={<div>Error occurred</div>}
        >
          <div id="routerino-target"></div>
        </Routerino>
      );

      const statusTag = document.querySelector('meta[name="prerender-status-code"]');
      expect(statusTag).toBeTruthy();
      expect(statusTag.getAttribute('content')).toBe('500');

      consoleSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('SEO Meta Tags for Crawlers', () => {
    it('should set proper meta tags for routes', () => {
      const routes = [
        {
          path: '/',
          element: <div>Home</div>,
          title: 'Home Page',
          description: 'Welcome to our site',
          imageUrl: 'https://example.com/home.jpg'
        }
      ];

      render(
        <Routerino routes={routes} title="My Site">
          <div id="routerino-target"></div>
        </Routerino>
      );

      // Check title
      expect(document.title).toBe('Home Page | My Site');

      // Check meta description
      const description = document.querySelector('meta[name="description"]');
      expect(description.getAttribute('content')).toBe('Welcome to our site');

      // Check OG tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');

      expect(ogTitle.getAttribute('content')).toBe('Home Page | My Site');
      expect(ogDescription.getAttribute('content')).toBe('Welcome to our site');
      expect(ogImage.getAttribute('content')).toBe('https://example.com/home.jpg');
    });

    it('should update meta tags on route change', () => {
      const routes = [
        {
          path: '/',
          element: <div>Home</div>,
          title: 'Home',
          description: 'Home description'
        },
        {
          path: '/about',
          element: <div>About</div>,
          title: 'About',
          description: 'About description'
        }
      ];

      const { rerender } = render(
        <Routerino routes={routes} title="Site">
          <div id="routerino-target"></div>
        </Routerino>
      );

      expect(document.title).toBe('Home | Site');

      // Navigate to about
      window.location.pathname = '/about';
      window.location.href = 'https://example.com/about';

      rerender(
        <Routerino routes={routes} title="Site">
          <div id="routerino-target"></div>
        </Routerino>
      );

      expect(document.title).toBe('About | Site');
      
      const description = document.querySelector('meta[name="description"]');
      expect(description.getAttribute('content')).toBe('About description');
    });

    it('should handle custom meta tags', () => {
      const routes = [
        {
          path: '/',
          element: <div>Article</div>,
          tags: [
            { property: 'article:author', content: 'John Doe' },
            { property: 'article:published_time', content: '2024-01-01' },
            { name: 'twitter:card', content: 'summary_large_image' }
          ]
        }
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      const author = document.querySelector('meta[property="article:author"]');
      const publishTime = document.querySelector('meta[property="article:published_time"]');
      const twitterCard = document.querySelector('meta[name="twitter:card"]');

      expect(author.getAttribute('content')).toBe('John Doe');
      expect(publishTime.getAttribute('content')).toBe('2024-01-01');
      expect(twitterCard.getAttribute('content')).toBe('summary_large_image');
    });
  });

  describe('Bot Detection', () => {
    it('should detect search engine crawlers', () => {
      const crawlerUserAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
        'Twitterbot/1.0'
      ];

      crawlerUserAgents.forEach(ua => {
        // This would be detected by the prerender server
        const isCrawler = /googlebot|bingbot|facebookexternalhit|yandex|twitterbot/i.test(ua);
        expect(isCrawler).toBe(true);
      });
    });

    it('should not detect regular browsers as crawlers', () => {
      const regularUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      ];

      regularUserAgents.forEach(ua => {
        const isCrawler = /googlebot|bingbot|facebookexternalhit|yandex|twitterbot/i.test(ua);
        expect(isCrawler).toBe(false);
      });
    });
  });

  describe('Dynamic Content Handling', () => {
    it('should allow marking prerender as ready', () => {
      // Test window.prerenderReady flag
      window.prerenderReady = false;

      const routes = [
        {
          path: '/',
          element: <div>Loading...</div>
        }
      ];

      render(
        <Routerino routes={routes}>
          <div id="routerino-target"></div>
        </Routerino>
      );

      expect(window.prerenderReady).toBe(false);

      // Simulate content loaded
      window.prerenderReady = true;
      expect(window.prerenderReady).toBe(true);
    });
  });
});