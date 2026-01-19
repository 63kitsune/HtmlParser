class HtmlParser {
    constructor(html = "") {
        this.html = html;
    }

    /**
     * Set or update the HTML string
     * @param {string} html - The HTML string to parse
     */
    setHtml(html) {
        this.html = html;
        return this;
    }

    /**
     * Get all elements with a specific class name
     * @param {string} className - The class name to search for
     * @param {string} tag - Optional tag name (e.g., 'div', 'a'). If not provided, searches all tags
     * @returns {Array<string>} Array of matching HTML elements
     */
    getByClass(className, tag = "[a-zA-Z][a-zA-Z0-9]*") {
        return HtmlParser.getByClass(this.html, className, tag);
    }

    /**
     * Static: Get all elements with a specific class name
     * @param {string} html - The HTML string to search
     * @param {string} className - The class name to search for
     * @param {string} tag - Optional tag name (e.g., 'div', 'a'). If not provided, searches all tags
     * @returns {Array<string>} Array of matching HTML elements
     */
    static getByClass(html, className, tag = "[a-zA-Z][a-zA-Z0-9]*") {
        const elements = [];
        // Match opening tag with the class, capturing everything until the closing tag
        const regex = new RegExp(
            `<(${tag})([^>]*\\bclass="[^"]*\\b${className}\\b[^"]*"[^>]*)>`,
            "gi",
        );

        let match;
        while ((match = regex.exec(html)) !== null) {
            const tagName = match[1];
            const startPos = match.index;

            // Find the matching closing tag
            const element = HtmlParser.extractElement(html, startPos, tagName);
            if (element) {
                elements.push(element);
            }
        }

        return elements;
    }

    /**
     * Extract a complete element including nested tags
     * @param {number} startPos - Starting position of the opening tag
     * @param {string} tagName - The tag name to match
     * @returns {string|null} The complete element or null
     */
    extractElement(startPos, tagName) {
        return HtmlParser.extractElement(this.html, startPos, tagName);
    }

    /**
     * Static: Extract a complete element including nested tags
     * @param {string} html - The HTML string
     * @param {number} startPos - Starting position of the opening tag
     * @param {string} tagName - The tag name to match
     * @returns {string|null} The complete element or null
     */
    static extractElement(html, startPos, tagName) {
        let depth = 0;
        let pos = startPos;

        const openRegex = new RegExp(`<${tagName}[^>]*>`, "gi");
        const closeRegex = new RegExp(`</${tagName}>`, "gi");

        // Find the end of the opening tag
        const openMatch = html
            .substring(pos)
            .match(new RegExp(`^<${tagName}[^>]*>`, "i"));
        if (!openMatch) return null;

        pos += openMatch[0].length;
        depth = 1;

        // Find matching closing tag
        while (depth > 0 && pos < html.length) {
            const nextOpen = html
                .substring(pos)
                .search(new RegExp(`<${tagName}[^>]*>`, "i"));
            const nextClose = html
                .substring(pos)
                .search(new RegExp(`</${tagName}>`, "i"));

            if (nextClose === -1) break;

            if (nextOpen !== -1 && nextOpen < nextClose) {
                pos +=
                    nextOpen +
                    html
                        .substring(pos + nextOpen)
                        .match(new RegExp(`^<${tagName}[^>]*>`, "i"))[0].length;
                depth++;
            } else {
                pos +=
                    nextClose +
                    html
                        .substring(pos + nextClose)
                        .match(new RegExp(`^</${tagName}>`, "i"))[0].length;
                depth--;
            }
        }

        return html.substring(startPos, pos);
    }

    /**
     * Get attribute value from an HTML element or string
     * @param {string} attrName - The attribute name
     * @returns {string|null} The attribute value or null
     */
    getAttr(attrName) {
        return HtmlParser.getAttr(this.html, attrName);
    }

    /**
     * Static: Get attribute value from an HTML element or string
     * @param {string} html - The HTML string or element
     * @param {string} attrName - The attribute name
     * @returns {string|null} The attribute value or null
     */
    static getAttr(html, attrName) {
        const regex = new RegExp(`\\b${attrName}="([^"]*)"`, "i");
        const match = html.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Get all attribute values from multiple elements
     * @param {Array<string>} elements - Array of HTML element strings
     * @param {string} attrName - The attribute name
     * @returns {Array<string|null>} Array of attribute values
     */
    static getAttrs(elements, attrName) {
        return elements.map((el) => HtmlParser.getAttr(el, attrName));
    }

    /**
     * Get text content from an HTML element (strips tags)
     * @returns {string} The text content
     */
    getText() {
        return HtmlParser.getText(this.html);
    }

    /**
     * Static: Get text content from an HTML element (strips tags)
     * @param {string} html - The HTML string
     * @returns {string} The text content
     */
    static getText(html) {
        return html.replace(/<[^>]*>/g, "").trim();
    }

    /**
     * Find elements by tag name with optional class
     * @param {string} tag - The tag name (e.g., 'a', 'div', 'img')
     * @param {string} className - Optional class name to filter by
     * @returns {Array<string>} Array of matching elements
     */
    getByTag(tag, className = null) {
        return HtmlParser.getByTag(this.html, tag, className);
    }

    /**
     * Static: Find elements by tag name with optional class
     * @param {string} html - The HTML string to search
     * @param {string} tag - The tag name (e.g., 'a', 'div', 'img')
     * @param {string} className - Optional class name to filter by
     * @returns {Array<string>} Array of matching elements
     */
    static getByTag(html, tag, className = null) {
        if (className) {
            return HtmlParser.getByClass(html, className, tag);
        }

        const elements = [];
        const regex = new RegExp(`<${tag}[^>]*>`, "gi");

        let match;
        while ((match = regex.exec(html)) !== null) {
            const startPos = match.index;
            const element = HtmlParser.extractElement(html, startPos, tag);
            if (element) {
                elements.push(element);
            }
        }

        return elements;
    }

    /**
     * Query selector - find first element matching selector
     * @param {string} selector - CSS selector (supports tag, .class, #id, tag.class, tag#id)
     * @returns {string|null} The first matching element or null
     */
    querySelector(selector) {
        return HtmlParser.querySelector(this.html, selector);
    }

    /**
     * Static: Query selector - find first element matching selector
     * @param {string} html - The HTML string
     * @param {string} selector - CSS selector (supports tag, .class, #id, tag.class, tag#id)
     * @returns {string|null} The first matching element or null
     */
    static querySelector(html, selector) {
        const elements = HtmlParser.querySelectorAll(html, selector);
        return elements.length > 0 ? elements[0] : null;
    }

    /**
     * Query selector all - find all elements matching selector
     * @param {string} selector - CSS selector (supports tag, .class, #id, tag.class, tag#id)
     * @returns {Array<string>} Array of matching elements
     */
    querySelectorAll(selector) {
        return HtmlParser.querySelectorAll(this.html, selector);
    }

    /**
     * Static: Query selector all - find all elements matching selector
     * @param {string} html - The HTML string
     * @param {string} selector - CSS selector (supports tag, .class, #id, tag.class, tag#id)
     * @returns {Array<string>} Array of matching elements
     */
    static querySelectorAll(html, selector) {
        // Parse simple selector - updated to support #id, .class, and combinations
        const match = selector.match(/^([a-zA-Z0-9]*)?(#[a-zA-Z0-9_-]+)?(\.[a-zA-Z0-9_-]+)?$/);
        if (!match) return [];

        const [, tag, idSelector, classSelector] = match;
        const id = idSelector ? idSelector.substring(1) : null; // Remove the #
        const className = classSelector ? classSelector.substring(1) : null; // Remove the .

        if (id) {
            return HtmlParser.getElementById(html, id);
        } else if (tag && className) {
            return HtmlParser.getByClass(html, className, tag);
        } else if (className) {
            return HtmlParser.getByClass(html, className);
        } else if (tag) {
            return HtmlParser.getByTag(html, tag);
        }

        return [];
    }

    /**
     * Find element by data attribute
     * @param {string} dataAttr - The data attribute name (without 'data-' prefix)
     * @returns {Array<string>} Array of matching elements
     */
    getByDataAttr(dataAttr) {
        return HtmlParser.getByDataAttr(this.html, dataAttr);
    }

    /**
     * Find element by ID
     * @param {string} id - The element ID
     * @returns {Array<string>} Array containing the matching element (0 or 1 element)
     */
    getElementById(id) {
        return HtmlParser.getElementById(this.html, id);
    }

    /**
     * Static: Find element by ID
     * @param {string} html - The HTML string
     * @param {string} id - The element ID to search for
     * @returns {Array<string>} Array containing the matching element (0 or 1 element)
     */
    static getElementById(html, id) {
        const elements = [];
        const regex = new RegExp(
            `<([a-zA-Z][a-zA-Z0-9]*)([^>]*\\bid="${id}"[^>]*)>`,
            "i",
        );

        const match = regex.exec(html);
        if (match) {
            const tagName = match[1];
            const startPos = match.index;
            const element = HtmlParser.extractElement(html, startPos, tagName);
            if (element) {
                elements.push(element);
            }
        }

        return elements;
    }

    /**
     * Find element by data attribute
     * @param {string} dataAttr - The data attribute name (without 'data-' prefix)
     * @returns {Array<string>} Array of matching elements
     */
    getByDataAttr(dataAttr) {
        return HtmlParser.getByDataAttr(this.html, dataAttr);
    }

    /**
     * Static: Find element by data attribute
     * @param {string} html - The HTML string
     * @param {string} dataAttr - The data attribute name (without 'data-' prefix)
     * @returns {Array<string>} Array of matching elements
     */
    static getByDataAttr(html, dataAttr) {
        const elements = [];
        const regex = new RegExp(
            `<([a-zA-Z][a-zA-Z0-9]*)[^>]*\\bdata-${dataAttr}="[^"]*"[^>]*>`,
            "gi",
        );

        let match;
        while ((match = regex.exec(html)) !== null) {
            const tagName = match[1];
            const startPos = match.index;
            const element = HtmlParser.extractElement(html, startPos, tagName);
            if (element) {
                elements.push(element);
            }
        }

        return elements;
    }

    /**
     * Extract inner HTML (content between opening and closing tags)
     * @returns {string} The inner HTML
     */
    innerHTML() {
        return HtmlParser.innerHTML(this.html);
    }

    /**
     * Static: Extract inner HTML (content between opening and closing tags)
     * @param {string} element - The HTML element string
     * @returns {string} The inner HTML
     */
    static innerHTML(element) {
        const match = element.match(/^<[^>]*>(.*)<\/[^>]*>$/s);
        return match ? match[1] : element;
    }
}

module.exports = HtmlParser;
