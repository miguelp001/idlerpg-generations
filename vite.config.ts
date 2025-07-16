import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
      define: {
        // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: true, // Generate sourcemaps for easier debugging
        rollupOptions: {
          output: {
            // Attempt to tree-shake more aggressively. Ensure unused exports are removed.
            // This might make debugging harder if you rely on examining module structure.
            // Consider if this is necessary based on your project's specific needs.
            compact: true, // Compact all generated IIFE code
            // Optionally, configure manualChunks for better vendor chunking
            // manualChunks: (id) => {
            //   if (id.includes('node_modules')) {
            //     return 'vendor';
            //   }
            //   return null;
            // },
          },
          // Ensure that the output format is compatible with tree-shaking
          // For most modern browsers and environments, 'es' (ES Module) is preferred
          // for its native tree-shaking capabilities.
          // treeshake: {
          //   moduleSideEffects: 'no-external',
          // },
        },
        // Set to true to enable CSS code splitting, which can also help with dead code removal
        cssCodeSplit: true,
        // Minify the output bundle. Terser is used by default in production mode.
        minify: 'terser' as const,
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true, // Remove debugger statements in production
            // pure_funcs: ['console.log'], // More aggressive removal of functions
          },
          format: {
            comments: false, // Remove all comments from the output
          },
        },
      }
    };
});
