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

export interface Coordinates {
    top: number;
    left: number;
}

export interface SuggestionItem {
    display: string;
    key: string;
    matchScore?: number;
}

/**
 * Gets caret coordinates for a textarea or input element.
 * Uses a hidden mirror div with fixed positioning to measure the caret.
 * @param {HTMLTextAreaElement | HTMLInputElement} el - The target element.
 * @returns {Coordinates} The top and left coordinates of the caret.
 */
function getCaretCoordinatesTextarea(el: HTMLTextAreaElement | HTMLInputElement): Coordinates {
    // Get the textarea's bounding rectangle (viewport coordinates)
    const rect = el.getBoundingClientRect();

    // Create or reuse the mirror div
    let mirrorDiv = document.getElementById("textarea-caret-mirror") as HTMLDivElement;
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
function getCaretCoordinatesEditable(el: HTMLElement): Coordinates {
    let coordinates: Coordinates = { top: 0, left: 0 };
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
        marker.parentNode?.removeChild(marker);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
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
export function getCaretCoordinates(el: HTMLElement): Coordinates {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
        return getCaretCoordinatesTextarea(el);
    } else {
        return getCaretCoordinatesEditable(el);
    }
}

/**
 * Returns the numeric value of a CSS property (e.g., lineHeight, fontSize) for a given element.
 * @param {HTMLElement} el - The target element.
 * @param {string} property - The CSS property (e.g., 'font-size', 'line-height').
 * @returns {number} The numeric value.
 */
export function getCSSNumericValue(el: HTMLElement, property: string): number {
    const value = window.getComputedStyle(el).getPropertyValue(property);
    return parseFloat(value) || 0;
}

/**
 * Returns the line height of an element. If line-height is 'normal', falls back to fontSize.
 * @param {HTMLElement} el - The target element.
 * @returns {number} The computed line height.
 */
export function getLineHeight(el: HTMLElement): number {
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
export function getMatchScore(suggestionKey: string, query: string): number {
    const key = suggestionKey.toLowerCase();
    const q = query.toLowerCase();
    if (!q) return 0;
    if (key === q) return 1;
    const index = key.indexOf(q);
    if (index === -1) return 0;
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
export function sortAndFilterSuggestions(
    suggestions: SuggestionItem[],
    query: string,
    minScore: number
): SuggestionItem[] {
    if (!query) return suggestions;
    suggestions.forEach(suggestion => {
        suggestion.matchScore = getMatchScore(suggestion.key, query);
    });
    const filtered = suggestions.filter(suggestion => suggestion.matchScore! >= minScore);
    filtered.sort((a, b) => b.matchScore! - a.matchScore!);
    return filtered;
}
