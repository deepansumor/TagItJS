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
 * Unified function to get caret coordinates for both contentEditable and textarea/input elements.
 * @param {HTMLElement} el - The target element.
 * @returns {Coordinates} The caret coordinates.
 */
export declare function getCaretCoordinates(el: HTMLElement): Coordinates;
/**
 * Returns the numeric value of a CSS property (e.g., lineHeight, fontSize) for a given element.
 * @param {HTMLElement} el - The target element.
 * @param {string} property - The CSS property (e.g., 'font-size', 'line-height').
 * @returns {number} The numeric value.
 */
export declare function getCSSNumericValue(el: HTMLElement, property: string): number;
/**
 * Returns the line height of an element. If line-height is 'normal', falls back to fontSize.
 * @param {HTMLElement} el - The target element.
 * @returns {number} The computed line height.
 */
export declare function getLineHeight(el: HTMLElement): number;
/**
 * Computes a normalized match score between 0 and 1.
 * 1 means an exact match (ignoring case), 0 means no match.
 * Otherwise, the score decreases as the query appears later in the suggestion key.
 * @param {string} suggestionKey - The suggestion key.
 * @param {string} query - The query text.
 * @returns {number} The normalized match score.
 */
export declare function getMatchScore(suggestionKey: string, query: string): number;
/**
 * Sorts and filters an array of suggestion objects based on match score.
 * Only returns suggestions whose match score is greater than or equal to minScore.
 * @param {SuggestionItem[]} suggestions - The array of suggestion objects.
 * @param {string} query - The query text (after the trigger).
 * @param {number} minScore - The minimum match score required.
 * @returns {SuggestionItem[]} The sorted (best match first) and filtered array.
 */
export declare function sortAndFilterSuggestions(suggestions: SuggestionItem[], query: string, minScore: number): SuggestionItem[];
