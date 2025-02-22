var TagIt;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCSSNumericValue: () => (/* binding */ getCSSNumericValue),
/* harmony export */   getCaretCoordinates: () => (/* binding */ getCaretCoordinates),
/* harmony export */   getLineHeight: () => (/* binding */ getLineHeight),
/* harmony export */   getMatchScore: () => (/* binding */ getMatchScore),
/* harmony export */   sortAndFilterSuggestions: () => (/* binding */ sortAndFilterSuggestions)
/* harmony export */ });
/**
 * TagItJS Utilities
 *
 * Provides helper functions for calculating caret coordinates,
 * CSS numeric values, line height, and suggestion scoring & sorting.
 *
 * @author
 * Deepansu Mor
 * @github https://github.com/deepansumor
 */
/**
 * Gets caret coordinates for a textarea or input element.
 * Uses a hidden mirror div with fixed positioning to measure the caret.
 * @param {HTMLTextAreaElement | HTMLInputElement} el - The target element.
 * @returns {Coordinates} The top and left coordinates of the caret.
 */
function getCaretCoordinatesTextarea(el) {
    // Get the textarea's bounding rectangle (viewport coordinates)
    const rect = el.getBoundingClientRect();
    // Create or reuse the mirror div
    let mirrorDiv = document.getElementById("textarea-caret-mirror");
    if (!mirrorDiv) {
        mirrorDiv = document.createElement('div');
        mirrorDiv.id = "textarea-caret-mirror";
        document.body.appendChild(mirrorDiv);
    }
    // Position the mirror div exactly over the textarea using fixed positioning
    mirrorDiv.style.position = "fixed";
    mirrorDiv.style.top = `${rect.top}px`;
    mirrorDiv.style.left = `${rect.left}px`;
    mirrorDiv.style.width = `${rect.width}px`;
    // Ensure mirror div remains hidden but rendered
    mirrorDiv.style.visibility = "hidden";
    mirrorDiv.style.whiteSpace = "pre-wrap";
    mirrorDiv.style.wordWrap = "break-word";
    // Copy essential styles from the textarea to the mirror div
    const style = window.getComputedStyle(el);
    mirrorDiv.style.font = style.font;
    mirrorDiv.style.padding = style.padding;
    mirrorDiv.style.border = style.border;
    mirrorDiv.style.lineHeight = style.lineHeight;
    // Set the mirror div's content to the textarea's value up to the caret position
    const value = el.value;
    const caretPos = el.selectionStart || 0;
    const beforeCaret = value.substring(0, caretPos);
    mirrorDiv.textContent = beforeCaret.replace(/\n$/, "\n\u200b");
    // Append a marker element to get the caret position
    const marker = document.createElement("span");
    marker.textContent = "\u200b";
    mirrorDiv.appendChild(marker);
    // Retrieve marker's coordinates using fixed positioning (viewport coordinates)
    const markerRect = marker.getBoundingClientRect();
    // Return the coordinates of the marker
    return {
        top: markerRect.top,
        left: markerRect.left
    };
}
/**
 * Gets caret coordinates for a contentEditable element.
 * Inserts a temporary marker element at the caret position and measures its coordinates.
 * @param {HTMLElement} el - The contentEditable element.
 * @returns {Coordinates} The top and left coordinates of the caret.
 */
function getCaretCoordinatesEditable(el) {
    var _a;
    let coordinates = { top: 0, left: 0 };
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange();
        range.collapse(true);
        const marker = document.createElement('span');
        marker.textContent = "\u200b";
        range.insertNode(marker);
        const rect = marker.getBoundingClientRect();
        coordinates = {
            top: rect.top,
            left: rect.left
        };
        // Clean up marker
        (_a = marker.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(marker);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    else {
        const rect = el.getBoundingClientRect();
        coordinates = {
            top: rect.top,
            left: rect.left
        };
    }
    return coordinates;
}
/**
 * Unified function to get caret coordinates for both contentEditable and textarea/input elements.
 * @param {HTMLElement} el - The target element.
 * @returns {Coordinates} The caret coordinates.
 */
function getCaretCoordinates(el) {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        return getCaretCoordinatesTextarea(el);
    }
    else {
        return getCaretCoordinatesEditable(el);
    }
}
/**
 * Returns the numeric value of a CSS property (e.g., lineHeight, fontSize) for a given element.
 * @param {HTMLElement} el - The target element.
 * @param {string} property - The CSS property (e.g., 'font-size', 'line-height').
 * @returns {number} The numeric value.
 */
function getCSSNumericValue(el, property) {
    const value = window.getComputedStyle(el).getPropertyValue(property);
    return parseFloat(value) || 0;
}
/**
 * Returns the line height of an element. If line-height is 'normal', falls back to fontSize.
 * @param {HTMLElement} el - The target element.
 * @returns {number} The computed line height.
 */
function getLineHeight(el) {
    const computed = window.getComputedStyle(el).getPropertyValue('line-height');
    if (computed === 'normal') {
        return getCSSNumericValue(el, 'font-size');
    }
    return getCSSNumericValue(el, 'line-height');
}
/**
 * Computes a normalized match score between 0 and 1.
 * 1 means an exact match (ignoring case), 0 means no match.
 * Otherwise, the score decreases as the query appears later in the suggestion key.
 * @param {string} suggestionKey - The suggestion key.
 * @param {string} query - The query text.
 * @returns {number} The normalized match score.
 */
function getMatchScore(suggestionKey, query) {
    const key = suggestionKey.toLowerCase();
    const q = query.toLowerCase();
    if (!q)
        return 0;
    if (key === q)
        return 1;
    const index = key.indexOf(q);
    if (index === -1)
        return 0;
    const score = 1 - index / key.length;
    return Math.max(0, Math.min(1, score));
}
/**
 * Sorts and filters an array of suggestion objects based on match score.
 * Only returns suggestions whose match score is greater than or equal to minScore.
 * @param {SuggestionItem[]} suggestions - The array of suggestion objects.
 * @param {string} query - The query text (after the trigger).
 * @param {number} minScore - The minimum match score required.
 * @returns {SuggestionItem[]} The sorted (best match first) and filtered array.
 */
function sortAndFilterSuggestions(suggestions, query, minScore) {
    if (!query)
        return suggestions;
    suggestions.forEach(suggestion => {
        suggestion.matchScore = getMatchScore(suggestion.key, query);
    });
    const filtered = suggestions.filter(suggestion => suggestion.matchScore >= minScore);
    filtered.sort((a, b) => b.matchScore - a.matchScore);
    return filtered;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/tagIt.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TagIt)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/**
 * TagIt.js - A JavaScript library for managing tag suggestions
 * in contentEditable and input/textarea elements.
 *
 * Features:
 *  - Configurable trigger character.
 *  - Middleware for transforming/filtering suggestions.
 *  - Asynchronous suggestion fetching with debouncing.
 *  - Real-time suggestion management (add/remove).
 *  - Scoring-based suggestion sorting and filtering.
 *
 * @author
 * Deepansu Mor
 * @github https://github.com/deepansumor
 */
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

class TagIt {
    /**
     * Constructor for initializing the TagIt class.
     * @param {HTMLElement} target - The HTML element (contentEditable or input/textarea) to attach TagIt to.
     * @param {TagItOptions} [options] - Configuration options for TagIt.
     */
    constructor(target, options) {
        var _a, _b, _c, _d, _e, _f;
        this.triggerChar = '@';
        this.savedRange = null;
        this.middlewares = [];
        this.fetchTimeout = null;
        this.target = target;
        this.suggestions = (options === null || options === void 0 ? void 0 : options.suggestions) || [];
        this.keepTrigger = (_a = options === null || options === void 0 ? void 0 : options.keepTrigger) !== null && _a !== void 0 ? _a : false;
        this.triggerChar = (_b = options === null || options === void 0 ? void 0 : options.triggerChar) !== null && _b !== void 0 ? _b : this.triggerChar;
        this.maxSuggestions = (_c = options === null || options === void 0 ? void 0 : options.maxSuggestions) !== null && _c !== void 0 ? _c : 5;
        this.minScore = (_d = options === null || options === void 0 ? void 0 : options.minScore) !== null && _d !== void 0 ? _d : 0;
        this.debounceTime = (_e = options === null || options === void 0 ? void 0 : options.debounceTime) !== null && _e !== void 0 ? _e : 300;
        this.enableLog = (_f = options === null || options === void 0 ? void 0 : options.enableLog) !== null && _f !== void 0 ? _f : false;
        this.fetchSuggestions = options === null || options === void 0 ? void 0 : options.fetchSuggestions;
        this.dropdown = this.createDropdown();
        this.attachEvents();
    }
    /**
     * Logs a message if logging is enabled.
     * @param {...any} msg - The message(s) to log.
     */
    log(...msg) {
        this.enableLog && console.log(...msg);
    }
    /**
     * Logs an error message.
     * @param {...any} msg - The error message(s) to log.
     */
    error(...msg) {
        console.error(...msg);
    }
    /**
     * Register a middleware function to transform/filter suggestions.
     * @param {SuggestionMiddleware} middleware - The middleware function.
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }
    /**
     * Adds a new suggestion to the instance in real-time.
     * @param {SuggestionItem} suggestion - The suggestion object to add.
     */
    addSuggestion(suggestion) {
        this.suggestions.push(suggestion);
    }
    /**
     * Removes a suggestion by its key.
     * @param {string} key - The key of the suggestion to remove.
     */
    removeSuggestion(key) {
        this.suggestions = this.suggestions.filter(item => item.key !== key);
    }
    /**
     * Creates and returns the dropdown element.
     * @returns {HTMLUListElement} The dropdown element.
     */
    createDropdown() {
        const dropdown = document.createElement('ul');
        Object.assign(dropdown.style, {
            position: 'fixed',
            display: 'none',
            listStyle: 'none',
            padding: '5px',
            margin: '0',
            border: '1px solid #ccc',
            background: '#fff'
        });
        document.body.appendChild(dropdown);
        return dropdown;
    }
    /**
     * Attaches keyup and click events to the target and document.
     */
    attachEvents() {
        this.target.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('click', this.onOutsideClick.bind(this));
    }
    /**
     * Handler for clicks outside the dropdown.
     * Hides the dropdown if clicked outside.
     * @param {MouseEvent} e - The click event.
     */
    onOutsideClick(e) {
        if (!this.dropdown.contains(e.target)) {
            this.hideDropdown();
        }
    }
    /**
     * Handler for keyup events on the target element.
     * Debounces async fetching of suggestions and displays the dropdown.
     */
    onKeyUp(e) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    this.savedRange = selection.getRangeAt(0).cloneRange();
                }
                if (this.isTriggerActive()) {
                    const position = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCaretCoordinates)(this.target);
                    if (this.fetchSuggestions) {
                        if (this.fetchTimeout) {
                            clearTimeout(this.fetchTimeout);
                        }
                        this.fetchTimeout = window.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                            try {
                                const asyncSuggestions = yield this.fetchSuggestions();
                                this.suggestions = asyncSuggestions;
                                this.showDropdown(position);
                            }
                            catch (error) {
                                this.error('Error fetching suggestions:', error);
                            }
                        }), this.debounceTime);
                    }
                    else {
                        this.showDropdown(position);
                    }
                }
                else {
                    if (this.fetchTimeout) {
                        clearTimeout(this.fetchTimeout);
                        this.fetchTimeout = null;
                    }
                    this.hideDropdown();
                }
            }
            catch (err) {
                this.error("Error in onKeyUp:", err);
            }
        });
    }
    // --- Helpers for Input/TextArea vs. ContentEditable ---
    isInputTarget() {
        return this.target instanceof HTMLTextAreaElement || this.target instanceof HTMLInputElement;
    }
    getTextBeforeCaretForInput() {
        const textarea = this.target;
        return textarea.value.substring(0, textarea.selectionStart);
    }
    getTextBeforeCaretForEditable() {
        var _a;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                return ((_a = node.textContent) === null || _a === void 0 ? void 0 : _a.substring(0, range.startOffset)) || '';
            }
        }
        return '';
    }
    /**
     * Checks if the trigger is active (i.e. the last word before caret starts with the trigger character).
     * @returns {boolean} True if active, false otherwise.
     */
    isTriggerActive() {
        let textBeforeCaret = this.isInputTarget()
            ? this.getTextBeforeCaretForInput()
            : this.getTextBeforeCaretForEditable();
        textBeforeCaret = textBeforeCaret.replace(/\u00A0/g, " ");
        const parts = textBeforeCaret.split(" ");
        const lastPart = parts[parts.length - 1];
        if (!lastPart.startsWith(this.triggerChar)) {
            this.log("Trigger character not found before caret:", lastPart);
        }
        return lastPart.startsWith(this.triggerChar) && this.getTriggerQuery().indexOf(" ") === -1;
    }
    getQueryForInput() {
        const textarea = this.target;
        const start = textarea.selectionStart;
        const value = textarea.value;
        const triggerIndex = value.lastIndexOf(this.triggerChar, start);
        if (triggerIndex === -1) {
            this.log("Trigger character not found in input value");
            return '';
        }
        return value.substring(triggerIndex + 1, start);
    }
    getQueryForEditable() {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent || '';
                const triggerIndex = textContent.lastIndexOf(this.triggerChar, range.startOffset);
                if (triggerIndex === -1) {
                    this.log("Trigger character not found in editable content");
                    return '';
                }
                return textContent.substring(triggerIndex + 1, range.startOffset);
            }
        }
        return '';
    }
    getTriggerQuery() {
        return this.isInputTarget() ? this.getQueryForInput() : this.getQueryForEditable();
    }
    // --- Dropdown Rendering and Scoring ---
    /**
     * Renders the suggestion dropdown based on current suggestions and query.
     * @param {Coordinates} position - The coordinates to position the dropdown.
     */
    showDropdown(position) {
        let suggestionsToShow = [...this.suggestions];
        for (const middleware of this.middlewares) {
            try {
                suggestionsToShow = middleware(suggestionsToShow);
            }
            catch (err) {
                this.error("Error in middleware:", err);
            }
        }
        const query = this.getTriggerQuery().toLowerCase();
        suggestionsToShow = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.sortAndFilterSuggestions)(suggestionsToShow, query, this.minScore);
        suggestionsToShow = suggestionsToShow.slice(0, this.maxSuggestions);
        if (suggestionsToShow.length === 0) {
            this.log("No suggestions available for query:", query);
            return this.hideDropdown();
        }
        this.dropdown.innerHTML = '';
        const lineHeight = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getLineHeight)(this.target);
        suggestionsToShow.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.display;
            Object.assign(li.style, {
                padding: '3px 6px',
                cursor: 'pointer'
            });
            li.addEventListener('mousedown', (e) => e.preventDefault());
            li.addEventListener('click', () => {
                try {
                    this.insertTag(item.display);
                }
                catch (err) {
                    this.error("Error inserting tag:", err);
                }
                this.hideDropdown();
            });
            this.dropdown.appendChild(li);
        });
        Object.assign(this.dropdown.style, {
            top: `${position.top + lineHeight}px`,
            left: `${position.left + 5}px`,
            display: 'block'
        });
    }
    /**
     * Hides the suggestion dropdown.
     */
    hideDropdown() {
        this.dropdown.style.display = 'none';
    }
    /**
     * Inserts the selected tag into the target element.
     * @param {string} tag - The tag text to insert.
     */
    insertTag(tag) {
        try {
            if (this.isInputTarget()) {
                this.insertTagForTextarea(tag);
            }
            else {
                this.insertTagForContentEditable(tag);
            }
        }
        catch (err) {
            this.error("Error in insertTag:", err);
        }
    }
    /**
     * Inserts the tag into a textarea or input element.
     * @param {string} tag - The tag text to insert.
     */
    insertTagForTextarea(tag) {
        const textarea = this.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const triggerIndex = value.lastIndexOf(this.triggerChar, start);
        if (triggerIndex === -1) {
            this.log("Trigger character not found when inserting tag in textarea");
            return;
        }
        const beforeTrigger = value.substring(0, triggerIndex);
        const afterCaret = value.substring(end);
        const triggerPart = this.keepTrigger ? this.triggerChar : '';
        const newValue = `${beforeTrigger}${triggerPart}${tag} ${afterCaret}`;
        textarea.value = newValue;
        const newPos = beforeTrigger.length + triggerPart.length + tag.length + 1;
        textarea.setSelectionRange(newPos, newPos);
    }
    /**
     * Inserts the tag into a contentEditable element.
     * @param {string} tag - The tag text to insert.
     */
    insertTagForContentEditable(tag) {
        const selection = window.getSelection();
        if (this.savedRange && selection) {
            selection.removeAllRanges();
            selection.addRange(this.savedRange);
        }
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType !== Node.TEXT_NODE) {
                this.log("Current node is not a text node; cannot insert tag");
                return;
            }
            const textContent = node.textContent || '';
            const triggerIndex = textContent.lastIndexOf(this.triggerChar, range.startOffset);
            if (triggerIndex === -1) {
                this.log("Trigger character not found in contentEditable text");
                return;
            }
            const before = textContent.substring(0, triggerIndex);
            const after = textContent.substring(range.startOffset);
            const triggerPart = this.keepTrigger ? this.triggerChar : '';
            const insertText = triggerPart + tag + ' ';
            const beforeNode = document.createTextNode(before);
            const tagNode = document.createTextNode(insertText);
            const afterNode = document.createTextNode(after);
            const parent = node.parentNode;
            if (!parent) {
                this.error("Parent node not found; cannot insert tag");
                return;
            }
            parent.insertBefore(beforeNode, node);
            parent.insertBefore(tagNode, node);
            parent.insertBefore(afterNode, node);
            parent.removeChild(node);
            const newRange = document.createRange();
            newRange.setStartAfter(tagNode);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
    /**
     * Destroys the TagIt instance by removing event listeners and the dropdown element.
     */
    destroy() {
        this.target.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('click', this.onOutsideClick.bind(this));
        document.body.removeChild(this.dropdown);
    }
}

})();

TagIt = __webpack_exports__["default"];
/******/ })()
;
//# sourceMappingURL=tagIt.js.map