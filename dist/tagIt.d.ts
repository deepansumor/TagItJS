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
import { SuggestionItem } from './utils';
export interface TagItOptions {
    suggestions?: SuggestionItem[];
    /**
     * Whether to keep the trigger character (e.g. '@') in the inserted tag.
     * If false, the trigger is removed.
     */
    keepTrigger?: boolean;
    triggerChar?: string;
    /**
     * Maximum number of suggestions to show in the dropdown.
     */
    maxSuggestions?: number;
    /**
     * Minimum match score (between 0 and 1) for a suggestion to be shown.
     */
    minScore?: number;
    /**
     * Optional async function to fetch suggestions.
     */
    fetchSuggestions?: () => Promise<SuggestionItem[]>;
    /**
     * Debounce time (in milliseconds) for async fetch calls.
     */
    debounceTime: number;
    /**
     * Enable logging for debugging purposes.
     */
    enableLog: boolean;
}
/**
 * Middleware function type.
 * Accepts an array of suggestion objects and returns a transformed array.
 */
export type SuggestionMiddleware = (suggestions: SuggestionItem[]) => SuggestionItem[];
export default class TagIt {
    private target;
    private dropdown;
    private suggestions;
    private keepTrigger;
    private triggerChar;
    private savedRange;
    private middlewares;
    private maxSuggestions;
    private minScore;
    private fetchSuggestions?;
    private debounceTime;
    private fetchTimeout;
    private enableLog;
    /**
     * Constructor for initializing the TagIt class.
     * @param {HTMLElement} target - The HTML element (contentEditable or input/textarea) to attach TagIt to.
     * @param {TagItOptions} [options] - Configuration options for TagIt.
     */
    constructor(target: HTMLElement, options?: TagItOptions);
    /**
     * Logs a message if logging is enabled.
     * @param {...any} msg - The message(s) to log.
     */
    private log;
    /**
     * Logs an error message.
     * @param {...any} msg - The error message(s) to log.
     */
    private error;
    /**
     * Register a middleware function to transform/filter suggestions.
     * @param {SuggestionMiddleware} middleware - The middleware function.
     */
    use(middleware: SuggestionMiddleware): void;
    /**
     * Adds a new suggestion to the instance in real-time.
     * @param {SuggestionItem} suggestion - The suggestion object to add.
     */
    addSuggestion(suggestion: SuggestionItem): void;
    /**
     * Removes a suggestion by its key.
     * @param {string} key - The key of the suggestion to remove.
     */
    removeSuggestion(key: string): void;
    /**
     * Creates and returns the dropdown element.
     * @returns {HTMLUListElement} The dropdown element.
     */
    private createDropdown;
    /**
     * Attaches keyup and click events to the target and document.
     */
    private attachEvents;
    /**
     * Handler for clicks outside the dropdown.
     * Hides the dropdown if clicked outside.
     * @param {MouseEvent} e - The click event.
     */
    private onOutsideClick;
    /**
     * Handler for keyup events on the target element.
     * Debounces async fetching of suggestions and displays the dropdown.
     */
    private onKeyUp;
    private isInputTarget;
    private getTextBeforeCaretForInput;
    private getTextBeforeCaretForEditable;
    /**
     * Checks if the trigger is active (i.e. the last word before caret starts with the trigger character).
     * @returns {boolean} True if active, false otherwise.
     */
    private isTriggerActive;
    private getQueryForInput;
    private getQueryForEditable;
    private getTriggerQuery;
    /**
     * Renders the suggestion dropdown based on current suggestions and query.
     * @param {Coordinates} position - The coordinates to position the dropdown.
     */
    private showDropdown;
    /**
     * Hides the suggestion dropdown.
     */
    private hideDropdown;
    /**
     * Inserts the selected tag into the target element.
     * @param {string} tag - The tag text to insert.
     */
    private insertTag;
    /**
     * Inserts the tag into a textarea or input element.
     * @param {string} tag - The tag text to insert.
     */
    private insertTagForTextarea;
    /**
     * Inserts the tag into a contentEditable element.
     * @param {string} tag - The tag text to insert.
     */
    private insertTagForContentEditable;
    /**
     * Destroys the TagIt instance by removing event listeners and the dropdown element.
     */
    destroy(): void;
}
