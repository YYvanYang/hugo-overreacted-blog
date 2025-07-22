// PostCSS configuration for enhanced CSS processing
// Supports asset optimization pipeline with autoprefixer and minification

module.exports = {
  plugins: [
    // Add vendor prefixes for better browser compatibility
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11'
      ],
      grid: 'autoplace'
    }),
    
    // Minify CSS in production
    ...(process.env.HUGO_ENVIRONMENT === 'production' ? [
      require('cssnano')({
        preset: ['default', {
          // Preserve important comments
          discardComments: {
            removeAll: false,
            removeAllButFirst: false
          },
          // Optimize calc() expressions
          calc: {
            precision: 3
          },
          // Normalize whitespace
          normalizeWhitespace: true,
          // Merge rules
          mergeRules: true,
          // Optimize font weights
          minifyFontValues: true,
          // Optimize gradients
          minifyGradients: true,
          // Convert colors to shorter formats
          colormin: true,
          // Optimize SVG
          svgo: {
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    removeViewBox: false,
                  },
                },
              },
            ],
          }
        }]
      })
    ] : [])
  ]
};