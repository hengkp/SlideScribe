# SlideScribe

![SlideScribe Logo](images/icon128.png)

SlideScribe is a Chrome extension that allows you to download all canvas slides on a webpage as a single PDF file. This extension is perfect for capturing presentations, drawings, and other canvas-based content from web pages.

## Features

- Detects all canvas elements on the page.
- Downloads all canvas slides as a single PDF file.

## Installation

### Clone the Repository

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/slidescribe.git
   cd slidescribe
   ```

### Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode" using the toggle switch at the top right.
3. Click "Load unpacked" and select the directory containing your extension files.

## Usage

1. Navigate to a webpage with canvas elements.
2. Click on the SlideScribe extension icon next to the address bar.
3. In the popup, click "Download as PDF" to download all canvas slides as a single PDF file.

## Development

### File Structure

```
slidescribe/
├── images/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js
├── manifest.json
├── popup.html
├── popup.js
└── README.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
