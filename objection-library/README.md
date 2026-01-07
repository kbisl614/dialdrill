# Sales Objection Handler - Interactive Guide

A clean, accessible web application featuring 35 common sales objections with structured, practical responses. Built with vanilla JavaScript, HTML, and CSS—no external dependencies required.

## Features

✅ **35 Real-World Objections** - Common B2B/B2C sales objections with proven response frameworks
✅ **Structured Responses** - Each response includes:
- Empathy & validation
- Clarifying question
- Response & positioning
- Call to action

✅ **Interactive Accordion UI** - Click to expand/collapse individual objections
✅ **Smooth Scrolling** - Scroll through all objections easily
✅ **Accessibility Built-in** - Semantic HTML, ARIA attributes, keyboard navigation
✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Zero Dependencies** - Pure vanilla JavaScript, no frameworks or libraries

## How to Run Locally

### Option 1: Simple HTTP Server (Recommended)

1. **Navigate to the directory:**
   ```bash
   cd objection-library
   ```

2. **Start a local server:**

   **Python 3:**
   ```bash
   python3 -m http.server 8000
   ```

   **Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Node.js (if you have `http-server` installed):**
   ```bash
   npx http-server -p 8000
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8000`

### Option 2: Direct File Open

Simply open `index.html` directly in your web browser by:
- Double-clicking the file, or
- Right-click → Open with → [Your Browser]

**Note:** Some features may work better with a local server (Option 1).

## File Structure

```
objection-library/
├── index.html      # Main HTML structure
├── styles.css      # All styling (responsive, accessible)
├── app.js          # JavaScript logic and objection dataset
└── README.md       # This file
```

## Usage

### Basic Navigation
- **Scroll** through the list to see all 35 objections
- **Click** any objection header to expand/collapse the response
- **Click** "Expand All" to open all objections at once
- **Click** "Collapse All" to close all objections

### Keyboard Navigation
- **Tab** to navigate between objection buttons
- **Enter** or **Space** to expand/collapse focused objection
- **Scroll** with arrow keys when focused on the container

## Customization

### Adding New Objections

Edit `app.js` and add new objects to the `objections` array:

```javascript
{
  id: 36,
  objection: "Your new objection here",
  response: {
    empathy: "Empathetic statement...",
    question: "Your clarifying question?",
    positioning: "Your response and positioning...",
    cta: "Your call to action..."
  }
}
```

### Styling Changes

Edit `styles.css` to customize:
- **Colors:** Search for `#667eea` (primary purple) and `#764ba2` (secondary purple)
- **Fonts:** Modify the `font-family` in the `body` selector
- **Layout:** Adjust `.objections-container` max-height for more/less visible objections

## Accessibility Features

- ✅ Semantic HTML5 elements
- ✅ ARIA attributes (`aria-expanded`, `aria-controls`, `role`)
- ✅ Keyboard navigation support
- ✅ Focus indicators for keyboard users
- ✅ Reduced motion support for users with vestibular disorders
- ✅ High contrast mode support
- ✅ Screen reader friendly structure

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## License

Free to use for personal and commercial purposes.

## Credits

Built with vanilla JavaScript, HTML5, and CSS3.
Designed for sales enablement and training.
