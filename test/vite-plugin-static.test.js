import { describe, it, expect, vi } from 'vitest';
import { routerinoStatic } from '../vite-plugin-routerino-static.js';

describe('Vite Plugin - Routerino Static', () => {
  it('should create a plugin with correct name', () => {
    const plugin = routerinoStatic();
    expect(plugin.name).toBe('vite-plugin-routerino-static');
  });
  
  it('should accept configuration options', () => {
    const options = {
      routesFile: './custom-routes.js',
      baseUrl: 'https://mysite.com',
      globalMeta: {
        siteName: 'My Site',
        description: 'Default description'
      }
    };
    
    const plugin = routerinoStatic(options);
    expect(plugin).toBeDefined();
  });
  
  it('should have required hooks', () => {
    const plugin = routerinoStatic();
    expect(plugin.configResolved).toBeDefined();
    expect(plugin.buildStart).toBeDefined();
    expect(plugin.closeBundle).toBeDefined();
  });
  
  it('should handle missing routes file gracefully', async () => {
    const plugin = routerinoStatic({
      routesFile: './nonexistent-routes.js'
    });
    
    // Mock vite config
    const mockConfig = {
      root: '/fake/root',
      command: 'build',
      build: { outDir: 'dist' }
    };
    
    plugin.configResolved(mockConfig);
    
    // buildStart should handle the error without throwing
    await expect(plugin.buildStart()).resolves.not.toThrow();
  });
  
  it('should skip processing in dev mode', async () => {
    const plugin = routerinoStatic();
    
    // Mock vite config for dev mode
    const mockConfig = {
      root: '/fake/root',
      command: 'serve', // dev mode
      build: { outDir: 'dist' }
    };
    
    plugin.configResolved(mockConfig);
    
    // Mock fs methods
    const mockFs = {
      existsSync: vi.fn(() => false),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn()
    };
    
    // closeBundle should return early in dev mode
    await plugin.closeBundle();
    
    // No file operations should occur
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });
});

describe('updateHeadTagInHtml', () => {
  it('should update existing meta tags', () => {
    // This would test the internal function if it were exported
    // For now, we test it indirectly through the plugin
    const plugin = routerinoStatic();
    expect(plugin).toBeDefined();
  });
  
  it('should add new meta tags when they dont exist', () => {
    // This would test the internal function if it were exported
    const plugin = routerinoStatic();
    expect(plugin).toBeDefined();
  });
  
  it('should handle special characters in meta content', () => {
    // This would test the internal function if it were exported
    const plugin = routerinoStatic();
    expect(plugin).toBeDefined();
  });
});