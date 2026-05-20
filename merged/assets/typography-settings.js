// Typography Settings Handler
document.addEventListener('DOMContentLoaded', function() {
  // Apply theme settings to typography CSS variables
  applyTypographySettings();
  
  // Apply color settings
  applyColorSettings();
});

function applyTypographySettings() {
  // Get theme settings
  let headingFont = document.documentElement.style.getPropertyValue('--font-heading-family') || "'Inter', sans-serif";
  let bodyFont = document.documentElement.style.getPropertyValue('--font-body-family') || "'Inter', sans-serif";
  
  // Extract just the font family name without the weight suffix (e.g., convert "Inter_n700" to just "Inter")
  headingFont = cleanFontFamily(headingFont);
  bodyFont = cleanFontFamily(bodyFont);
  
  const headingScale = parseInt(document.documentElement.getAttribute('data-heading-scale') || 100) / 100;
  const bodyScale = parseInt(document.documentElement.getAttribute('data-body-scale') || 100) / 100;
  const headingLetterSpacing = document.documentElement.getAttribute('data-heading-letter-spacing') || '-0.3';
  const bodyLetterSpacing = document.documentElement.getAttribute('data-body-letter-spacing') || '-0.3';
  const buttonTextCase = document.documentElement.getAttribute('data-button-text-case') || 'uppercase';
  
  // Get font weight settings
  const fontWeightRegular = document.documentElement.getAttribute('data-font-weight-regular') || '400';
  const fontWeightSemibold = document.documentElement.getAttribute('data-font-weight-semibold') || '600';
  const fontWeightBold = document.documentElement.getAttribute('data-font-weight-bold') || '700';
  
  // Set font families
  document.documentElement.style.setProperty('--font-body', bodyFont);
  document.documentElement.style.setProperty('--font-heading', headingFont);
  
  // Set letter spacing directly from the numeric values
  const headingLetterSpacingValue = `${headingLetterSpacing}px`;
  const bodyLetterSpacingValue = `${bodyLetterSpacing}px`;
  
  document.documentElement.style.setProperty('--letter-spacing-heading', headingLetterSpacingValue);
  document.documentElement.style.setProperty('--letter-spacing-body', bodyLetterSpacingValue);
  
  // Set font weights
  document.documentElement.style.setProperty('--font-weight-regular', fontWeightRegular);
  document.documentElement.style.setProperty('--font-weight-semibold', fontWeightSemibold);
  document.documentElement.style.setProperty('--font-weight-bold', fontWeightBold);
  
  // Apply font scaling based on theme settings
  const fontSizeBases = {
    h1: { min: 32, max: 48 },
    h2: { min: 28, max: 40 },
    h3: { min: 24, max: 32 },
    h4: { min: 20, max: 24 },
    h5: { min: 18, max: 20 },
    h6: { min: 16, max: 18 },
    bodyLarge: { min: 18, max: 20 },
    body: { min: 16, max: 16 },
    bodySmall: { min: 14, max: 14 },
    caption: { min: 12, max: 12 }
  };
  
  // Apply heading scaling
  Object.keys(fontSizeBases).forEach(key => {
    if (key.startsWith('h')) {
      const base = fontSizeBases[key];
      const minSize = Math.round(base.min * headingScale);
      const maxSize = Math.round(base.max * headingScale);
      
      document.documentElement.style.setProperty(`--min-font-size-${key}`, `${minSize}px`);
      document.documentElement.style.setProperty(`--max-font-size-${key}`, `${maxSize}px`);
      document.documentElement.style.setProperty(
        `--font-size-${key}`, 
        `calc(${minSize}px + (${maxSize} - ${minSize}) * ((100vw - 375px) / (1440 - 375)))`
      );
    }
  });
  
  // Apply body text scaling
  ['bodyLarge', 'body', 'bodySmall', 'caption'].forEach(key => {
    const base = fontSizeBases[key];
    const minSize = Math.round(base.min * bodyScale);
    const maxSize = Math.round(base.max * bodyScale);
    
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    document.documentElement.style.setProperty(`--font-size-${cssKey}`, `${minSize}px`);
  });
  
  // Apply button text case
  document.documentElement.style.setProperty('--button-text-transform', buttonTextCase);
  
  // Add class to body for easier styling
  document.body.classList.add('typography-settings-applied');
  
  // Force CSS to be re-evaluated with our weight settings by adding a custom style tag
  applyFontWeightOverrides();
}

// Helper function to clean up font family names by removing weight suffixes
function cleanFontFamily(fontFamily) {
  // Remove weight suffixes like _n400, _n700, etc.
  return fontFamily.replace(/_n\d+/g, '');
}

// Force CSS to apply our custom font weights by adding a style tag with high specificity
function applyFontWeightOverrides() {
  // Remove any existing font weight override styles
  const existingStyle = document.getElementById('font-weight-overrides');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Create a new style element
  const style = document.createElement('style');
  style.id = 'font-weight-overrides';
  
  // Add CSS rules with high specificity to override any existing font-weight styles
  style.textContent = `
    /* Regular weight elements */
    body, p, div, input, textarea, select {
      font-weight: var(--font-weight-regular) !important;
    }
    
    /* Semi-bold elements */
    h3, h4, h5, h6, th, .semi-bold {
      font-weight: var(--font-weight-semibold) !important;
    }
    
    /* Bold elements */
    h1, h2, strong, b, .bold, .heading, .btn--primary, .btn--secondary {
      font-weight: var(--font-weight-bold) !important;
    }
  `;
  
  // Add the style to the document head
  document.head.appendChild(style);
}

// Apply global color settings
function applyColorSettings() {
  // Get color values from theme settings (Shopify liquid variables injected in the HTML)
  const textColor = document.documentElement.getAttribute('data-global-text-color') || '#000000';
  const mainAccent = document.documentElement.getAttribute('data-global-main-accent') || '#ef4a65';
  const lightAccent = document.documentElement.getAttribute('data-global-light-accent') || '#ffeaee';
  
  // Apply colors as CSS variables
  document.documentElement.style.setProperty('--color-text', textColor);
  document.documentElement.style.setProperty('--color-main-accent', mainAccent);
  document.documentElement.style.setProperty('--color-light-accent', lightAccent);
  
  // Add a class to indicate color settings have been applied
  document.body.classList.add('global-colors-applied');
}

// Function to update a specific typography setting
function updateTypographySetting(settingName, value) {
  document.documentElement.setAttribute(`data-${settingName}`, value);
  applyTypographySettings();
}

// Function to update a specific color setting
function updateColorSetting(settingName, value) {
  document.documentElement.setAttribute(`data-${settingName}`, value);
  applyColorSettings();
} 