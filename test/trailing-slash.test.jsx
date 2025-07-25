import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Routerino from '../routerino.jsx'

describe('Trailing Slash Handling', () => {
  beforeEach(() => {
    // Reset window location
    delete window.location
    window.location = new URL('http://localhost/')
    
    // Clear all meta tags
    document.querySelectorAll('meta').forEach(tag => tag.remove())
    
    // Mock console
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('adds redirect header when useTrailingSlash=true and URL lacks trailing slash', () => {
    window.location = new URL('http://localhost/about')
    const routes = [
      { path: '/about/', element: <div>About</div> }
    ]
    
    render(<Routerino routes={routes} useTrailingSlash={true} />)
    
    const statusTag = document.querySelector('meta[name="prerender-status-code"]')
    expect(statusTag).toBeTruthy()
    expect(statusTag.getAttribute('content')).toBe('301')
    
    const headerTag = document.querySelector('meta[name="prerender-header"]')
    expect(headerTag).toBeTruthy()
    expect(headerTag.getAttribute('content')).toBe('Location: http://localhost/about/')
  })

  it('adds redirect header when useTrailingSlash=false and URL has trailing slash', () => {
    window.location = new URL('http://localhost/about/')
    const routes = [
      { path: '/about', element: <div>About</div> }
    ]
    
    render(<Routerino routes={routes} useTrailingSlash={false} />)
    
    const statusTag = document.querySelector('meta[name="prerender-status-code"]')
    expect(statusTag).toBeTruthy()
    expect(statusTag.getAttribute('content')).toBe('301')
    
    const headerTag = document.querySelector('meta[name="prerender-header"]')
    expect(headerTag).toBeTruthy()
    expect(headerTag.getAttribute('content')).toBe('Location: http://localhost/about')
  })

  it('does not add redirect headers when usePrerenderTags=false', () => {
    window.location = new URL('http://localhost/about')
    const routes = [
      { path: '/about/', element: <div>About</div> }
    ]
    
    render(<Routerino routes={routes} useTrailingSlash={true} usePrerenderTags={false} />)
    
    const statusTag = document.querySelector('meta[name="prerender-status-code"]')
    expect(statusTag).toBeFalsy()
    
    const headerTag = document.querySelector('meta[name="prerender-header"]')
    expect(headerTag).toBeFalsy()
  })

  it('does not redirect root path', () => {
    window.location = new URL('http://localhost/')
    const routes = [
      { path: '/', element: <div>Home</div> }
    ]
    
    render(<Routerino routes={routes} useTrailingSlash={false} />)
    
    const statusTag = document.querySelector('meta[name="prerender-status-code"]')
    expect(statusTag).toBeFalsy()
  })
})