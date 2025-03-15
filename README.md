# Password Generator Chrome Extension

A secure and customizable password generator extension that helps users create strong passwords with various options.

## Features

- Multiple password generation modes:
  - Easy to say (alphabetic characters only)
  - Easy to read (avoids similar-looking characters)
  - All characters (maximum security)
  - GUID/UUID generation
- Customizable password length
- Character set options (uppercase, lowercase, numbers, symbols)
- Password strength indicator
- Accessible design with keyboard navigation and screen reader support
- Secure random number generation using Web Crypto API
- Minimal permissions required
- Clear visual feedback for actions

## Security Features

- Uses Web Crypto API for secure random number generation
- Content Security Policy (CSP) to prevent XSS attacks
- Minimal permission requirements (only `clipboardWrite`)
- Input sanitization and validation
- Secure password generation algorithms

## Code Structure

The codebase has been modularized for better maintainability:

- `passwordGenerator.js`: Core password generation logic
- `uiController.js`: UI interaction and state management
- `popup.js`: Extension initialization and error handling
- `styles.css`: Modular CSS with CSS variables

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Development

### Prerequisites

- Chrome browser
- Basic understanding of Chrome extension development

### Local Development

1. Make changes to the source code
2. Reload the extension in Chrome
3. The extension will automatically use the updated code

### Best Practices

- Use `const` and `let` for variable declarations
- Follow the modular structure
- Test changes thoroughly, especially security-related features
- Maintain accessibility standards
- Update documentation when making changes

## Security Considerations

- The extension uses only local storage and has no network access
- Password generation is done entirely client-side
- Uses secure random number generation
- Implements proper CSP headers
- Minimal permission scope

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Screen reader announcements
- High contrast ratios
- Clear visual feedback
- Proper heading structure

## Recent Changes

- Modularized codebase for better maintainability
- Enhanced error handling and user feedback
- Improved accessibility features
- Added secure random number generation
- Updated security policies
- Added comprehensive documentation