# HTML Parser

A lightweight, regex-based HTML parser designed for high-performance web scraping.
i wanted to scrape like 80,000 pages and jsdom was just too slow. (i didn't do my research first, so i din't know about htmlparser2 lol)

## Overview

HtmlParser provides a set of static and instance methods to quickly parse HTML strings and extract elements based on class names, tag names, IDs, data attributes, and CSS-like selectors. It is optimized for speed and minimal memory usage, making it ideal for large-scale web scraping tasks.

## Features

- **Ultra-fast parsing** - Significantly faster than traditional DOM parsers
- **Simple API** - Familiar jQuery-like selectors
- **Zero dependencies** - No external packages required
- **Lightweight** - Minimal memory footprint
- **Static & instance methods** - Use whichever fits your workflow

## Limitations

### 1. **Malformed HTML**
HtmlParser uses regex patterns and may not handle deeply malformed HTML as gracefully as a full DOM parser. It works best with reasonably well-structured HTML.

### 2. **Complex CSS Selectors**
Currently supports basic selectors:
- Tag names: `div`, `a`, `span`
- Class names: `.className`
- IDs: `#elementId`
- Combined: `tag.className`, `tag#id`

Does **not** support:
- Descendant selectors (e.g., `div > p`, `div p`)
- Pseudo-classes (e.g., `:first-child`, `:hover`)
- Attribute selectors (e.g., `[type="text"]`)
- Complex combinators

### 3. **Self-Closing Tags**
May not perfectly handle self-closing tags or tags without closing tags (e.g., `<img>`, `<br>`, `<input>`).

### 4. **Nested Same-Tag Elements**
Works with nested elements, but deeply nested structures of the same tag may require careful handling.

### 5. **No DOM Modification**
This is a **read-only** parser. It cannot modify HTML structure or create new elements. Use it for data extraction, not DOM manipulation.

### 6. **No JavaScript Execution**
Unlike headless browsers, this parser only processes static HTML. Dynamic content loaded via JavaScript won't be available.

### 7. **Case Sensitivity**
HTML parsing is generally case-insensitive, but attribute matching is case-sensitive in the current implementation.

## When to Use

✅ **Use HtmlParser when:**
- You need maximum performance for HTML parsing
- You're extracting data from well-structured HTML
- You're building web scrapers
- Memory efficiency is important
- You need zero dependencies

❌ **Use a full DOM parser when:**
- You want something fullproof and robust
- You need to modify HTML structure
- You need complex CSS selectors
- You're working with highly malformed HTML
- You need full W3C DOM API compatibility


## Installation

Simply copy `HtmlParser.js` to your project directory.

## How to Use

### Basic Usage

```javascript
import HtmlParser from './HtmlParser.js';

// Fetch some HTML
const response = await fetch('https://example.com');
const html = await response.text();

// Static methods (recommended for one-off parsing)
const div = HtmlParser.querySelector(html, 'div');
console.log(HtmlParser.getText(div));
// Example DomainThis domain is for use in documentation examples without needing permission. Avoid use in operations.Learn more
```

### Other Examples

```javascript
// Get elements by class name
const items = HtmlParser.getByClass(html, 'className');
items.forEach(item => {
    console.log(HtmlParser.getText(item));
});

// Get element by ID
const header = HtmlParser.getElementById(html, 'headerId');
console.log(HtmlParser.innerHTML(header));

// Get elements by query selector / getAttribute
const links = HtmlParser.querySelectorAll(html, 'a.link-class');
links.forEach(link => {
    console.log(HtmlParser.getAttr(link, 'href'));
});


```


## Benchmark Results 

Performance comparison against popular HTML parsing libraries. [[Source](./bench.js)]
on my machine

| Task Name       | Mean Latency (ms) | Min Latency (ms) | Max Latency (ms) | 99th Percentile (ms) | Samples Count |
|-----------------|-------------------|------------------|------------------|----------------------|----------------|
| **HtmlParser**  | **3.14**          | **2.24**         | **13.95**        | **11.22**            | **1623**       |
| jsdom           | 131.10            | 71.09            | 272.04           | 266.35               | 320            |
| cheerio         | 32.39             | 8.12             | 75.25            | 74.37                | 320            |
| node-html-parser| 21.03             | 5.17             | 58.03            | 53.26                | 506            |
| htmlparser2     | 4.11              | 2.11             | 27.64            | 21.90                | 1253           |

**Performance Summary:**
- **41x faster** than JSDOM
- **10x faster** than Cheerio
- **6.7x faster** than node-html-parser
- **1.3x faster** than htmlparser2

## API Reference

### Static Methods

- `HtmlParser.getByClass(html, className, tag?)` - Get elements by class name
- `HtmlParser.getByTag(html, tag, className?)` - Get elements by tag name
- `HtmlParser.getElementById(html, id)` - Get element by ID
- `HtmlParser.getByDataAttr(html, dataAttr)` - Get elements by data attribute
- `HtmlParser.querySelector(html, selector)` - Get first matching element
- `HtmlParser.querySelectorAll(html, selector)` - Get all matching elements
- `HtmlParser.getAttr(element, attrName)` - Get attribute value
- `HtmlParser.getAttrs(elements, attrName)` - Get attribute from multiple elements
- `HtmlParser.getText(element)` - Get text content
- `HtmlParser.innerHTML(element)` - Get inner HTML
- `HtmlParser.extractElement(html, startPos, tagName)` - Extract complete element

### Instance Methods

All static methods are available as instance methods (without the `html` parameter):

## Running Benchmarks

```bash
node bench.js
```

# Have a issue or feature request?
FIX IT YOURSELF

Feel free to fork the repository and submit a pull request with your changes.


## License
WTFPL - Do What The F*ck You Want To Public License
