
# TagIt.js

TagIt.js is a robust JavaScript library for managing tag suggestions in contentEditable elements as well as input/textarea fields. It supports configurable trigger characters, middleware for filtering or transforming suggestions, asynchronous suggestion fetching with debouncing, real-time suggestion management, and scoring-based suggestion sorting.

## Features

- **Configurable Trigger**: Set your own trigger character (default is `@`).
- **Middleware Support**: Easily filter or transform suggestions.
- **Async Data Loading**: Fetch suggestions asynchronously with debouncing.
- **Real-Time Updates**: Add or remove suggestions dynamically.
- **Scoring & Sorting**: Suggestions are scored and sorted based on match quality.
- **Dual Compatibility**: Works seamlessly with both contentEditable elements and input/textarea fields.
- **Verbose Logging**: Enable logging for debugging.

## Installation

You can install TagIt.js include the bundled JavaScript via a CDN or local.


Or include via a `<script>` tag:


```html
<script src="../dist/tagIt.min.js"></script>
```

```html
<script src="https://cdn.jsdelivr.net/gh/deepansumor/TagItJS@latest/dist/tagIt.min.js"></script>
```


## Usage

### Basic Example with ContentEditable

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TagIt.js Demo - ContentEditable</title>
  <style>
    #editor {
      border: 1px solid #ccc;
      padding: 10px;
      min-height: 150px;
      background: #fff;
    }
  </style>
</head>
<body>
  <h1>TagIt.js - ContentEditable Example</h1>
  <div id="editor" contenteditable="true">Type '#' here...</div>

  <!-- Include TagIt.js -->
  <script src="../dist/tagIt.js"></script>
  <script>
    // Convert suggestion strings into suggestion objects.
    var suggestions = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'].map(function(s) {
      return { display: s, key: s };
    });

    // Fake async fetch function to simulate a delay.
    function fakeFetchSuggestions() {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve([
            { display: 'Alice', key: 'Alice' },
            { display: 'Bob', key: 'Bob' },
            { display: 'Charlie', key: 'Charlie' },
            { display: 'David', key: 'David' },
            { display: 'Eve', key: 'Eve' },
            { display: 'Mallory', key: 'Mallory' }
          ]);
        }, 500);
      });
    }

    // Initialize TagIt on the contentEditable element.
    var editor = document.getElementById('editor');
    if (editor) {
      var tagItInstance = new TagIt(editor, {
        suggestions: suggestions,
        keepTrigger: true,
        triggerChar: "#",
        maxSuggestions: 5,
        minScore: 0.5,
        debounceTime: 300,
        enableLog: true,
        fetchSuggestions: fakeFetchSuggestions
      });

      // Middleware: Only include suggestions with a key longer than 3 characters.
      tagItInstance.use(function(suggestions) {
        return suggestions.filter(function(item) {
          return item.key.length > 3;
        });
      });

      // Example: Add a new suggestion in real-time after 3 seconds.
      setTimeout(function() {
        tagItInstance.addSuggestion({ display: 'Zoe', key: 'Zoe' });
        console.log("Added suggestion: Zoe");
      }, 3000);

      // Example: Remove a suggestion in real-time after 6 seconds.
      setTimeout(function() {
        tagItInstance.removeSuggestion('Bob');
        console.log("Removed suggestion: Bob");
      }, 6000);
    }
  </script>
</body>
</html>
```

### Example with Textarea

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TagIt.js Demo - Textarea</title>
  <style>
    #textarea {
      width: 100%;
      height: 150px;
      padding: 10px;
      border: 1px solid #ccc;
      background: #fff;
    }
  </style>
</head>
<body>
  <h1>TagIt.js - Textarea Example</h1>
  <textarea id="textarea" placeholder="Type '#' here..."></textarea>

  <!-- Include TagIt.js -->
  <script src="../dist/tagIt.js"></script>
  <script>
    var suggestions = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'].map(function(s) {
      return { display: s, key: s };
    });

    // Fake async fetch function.
    function fakeFetchSuggestions() {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve([
            { display: 'Alice', key: 'Alice' },
            { display: 'Bob', key: 'Bob' },
            { display: 'Charlie', key: 'Charlie' },
            { display: 'David', key: 'David' },
            { display: 'Eve', key: 'Eve' },
            { display: 'Mallory', key: 'Mallory' }
          ]);
        }, 500);
      });
    }

    // Initialize TagIt on the textarea.
    var textarea = document.getElementById('textarea');
    if (textarea) {
      new TagIt(textarea, {
        suggestions: suggestions,
        maxSuggestions: 5,
        debounceTime: 300,
        enableLog: true,
        fetchSuggestions: fakeFetchSuggestions
      });
    }
  </script>
</body>
</html>
```

## Configuration Options

| Option            | Type                              | Default | Description                                                      |
|-------------------|-----------------------------------|---------|------------------------------------------------------------------|
| suggestions       | SuggestionItem[]                  | `[]`    | Initial array of suggestion objects.                           |
| keepTrigger       | boolean                           | `false` | Whether to keep the trigger character in the inserted tag.       |
| triggerChar       | string                            | `'@'`   | The character that triggers the tag suggestion dropdown.         |
| maxSuggestions    | number                            | `5`     | Maximum number of suggestions to display in the dropdown.        |
| minScore          | number                            | `0`     | Minimum match score (0–1) for a suggestion to be shown.            |
| fetchSuggestions  | () => Promise<SuggestionItem[]>   | `undefined` | Async function for fetching suggestions dynamically.         |
| debounceTime      | number                            | `300`   | Delay in milliseconds for debouncing async fetch calls.          |
| enableLog         | boolean                           | `false` | Enable logging for debugging.                                    |

## API

### Methods

- **use(middleware: SuggestionMiddleware): void**  
  Registers a middleware function to transform or filter suggestions.

- **addSuggestion(suggestion: SuggestionItem): void**  
  Adds a new suggestion in real-time.

- **removeSuggestion(key: string): void**  
  Removes a suggestion by its key.

- **destroy(): void**  
  Cleans up event listeners and removes the dropdown element.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request with improvements or bug fixes.

## License

This project is licensed under the MIT License.

