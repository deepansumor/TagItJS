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

import {
    getCaretCoordinates,
    Coordinates,
    getLineHeight,
    getMatchScore,
    sortAndFilterSuggestions,
    SuggestionItem
} from './utils';

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
    private target: HTMLElement;
    private dropdown: HTMLUListElement;
    private suggestions: SuggestionItem[];
    private keepTrigger: boolean;
    private triggerChar: string = '@';
    private savedRange: Range | null = null;
    private middlewares: SuggestionMiddleware[] = [];
    private maxSuggestions: number;
    private minScore: number;
    private fetchSuggestions?: () => Promise<SuggestionItem[]>;
    private debounceTime: number;
    private fetchTimeout: number | null = null;
    private enableLog: boolean;

    /**
     * Constructor for initializing the TagIt class.
     * @param {HTMLElement} target - The HTML element (contentEditable or input/textarea) to attach TagIt to.
     * @param {TagItOptions} [options] - Configuration options for TagIt.
     */
    constructor(target: HTMLElement, options?: TagItOptions) {
        this.target = target;
        this.suggestions = options?.suggestions || [];
        this.keepTrigger = options?.keepTrigger ?? false;
        this.triggerChar = options?.triggerChar ?? this.triggerChar;
        this.maxSuggestions = options?.maxSuggestions ?? 5;
        this.minScore = options?.minScore ?? 0;
        this.debounceTime = options?.debounceTime ?? 300;
        this.enableLog = options?.enableLog ?? false;
        this.fetchSuggestions = options?.fetchSuggestions;
        this.dropdown = this.createDropdown();
        this.attachEvents();
    }

    /**
     * Logs a message if logging is enabled.
     * @param {...any} msg - The message(s) to log.
     */
    private log(...msg: any[]): void {
        this.enableLog && console.log(...msg);
    }

    /**
     * Logs an error message.
     * @param {...any} msg - The error message(s) to log.
     */
    private error(...msg: any[]): void {
        console.error(...msg);
    }

    /**
     * Register a middleware function to transform/filter suggestions.
     * @param {SuggestionMiddleware} middleware - The middleware function.
     */
    public use(middleware: SuggestionMiddleware): void {
        this.middlewares.push(middleware);
    }

    /**
     * Adds a new suggestion to the instance in real-time.
     * @param {SuggestionItem} suggestion - The suggestion object to add.
     */
    public addSuggestion(suggestion: SuggestionItem): void {
        this.suggestions.push(suggestion);
    }

    /**
     * Removes a suggestion by its key.
     * @param {string} key - The key of the suggestion to remove.
     */
    public removeSuggestion(key: string): void {
        this.suggestions = this.suggestions.filter(item => item.key !== key);
    }

    /**
     * Creates and returns the dropdown element.
     * @returns {HTMLUListElement} The dropdown element.
     */
    private createDropdown(): HTMLUListElement {
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
    private attachEvents(): void {
        this.target.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('click', this.onOutsideClick.bind(this));
    }

    /**
     * Handler for clicks outside the dropdown.
     * Hides the dropdown if clicked outside.
     * @param {MouseEvent} e - The click event.
     */
    private onOutsideClick(e: MouseEvent): void {
        if (!this.dropdown.contains(e.target as Node)) {
            this.hideDropdown();
        }
    }

    /**
     * Handler for keyup events on the target element.
     * Debounces async fetching of suggestions and displays the dropdown.
     */
    private async onKeyUp(e: KeyboardEvent): Promise<void> {
        try {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                this.savedRange = selection.getRangeAt(0).cloneRange();
            }
            if (this.isTriggerActive()) {
                const position: Coordinates = getCaretCoordinates(this.target);
                if (this.fetchSuggestions) {
                    if (this.fetchTimeout) {
                        clearTimeout(this.fetchTimeout);
                    }
                    this.fetchTimeout = window.setTimeout(async () => {
                        try {
                            const asyncSuggestions = await this.fetchSuggestions!();
                            this.suggestions = asyncSuggestions;
                            this.showDropdown(position);
                        } catch (error) {
                            this.error('Error fetching suggestions:', error);
                        }
                    }, this.debounceTime);
                } else {
                    this.showDropdown(position);
                }
            } else {
                if (this.fetchTimeout) {
                    clearTimeout(this.fetchTimeout);
                    this.fetchTimeout = null;
                }
                this.hideDropdown();
            }
        } catch (err) {
            this.error("Error in onKeyUp:", err);
        }
    }

    // --- Helpers for Input/TextArea vs. ContentEditable ---

    private isInputTarget(): boolean {
        return this.target instanceof HTMLTextAreaElement || this.target instanceof HTMLInputElement;
    }

    private getTextBeforeCaretForInput(): string {
        const textarea = this.target as HTMLTextAreaElement;
        return textarea.value.substring(0, textarea.selectionStart);
    }

    private getTextBeforeCaretForEditable(): string {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const node = range.startContainer;
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent?.substring(0, range.startOffset) || '';
            }
        }
        return '';
    }

    /**
     * Checks if the trigger is active (i.e. the last word before caret starts with the trigger character).
     * @returns {boolean} True if active, false otherwise.
     */
    private isTriggerActive(): boolean {
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

    private getQueryForInput(): string {
        const textarea = this.target as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const value = textarea.value;
        const triggerIndex = value.lastIndexOf(this.triggerChar, start);
        if (triggerIndex === -1) {
            this.log("Trigger character not found in input value");
            return '';
        }
        return value.substring(triggerIndex + 1, start);
    }

    private getQueryForEditable(): string {
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

    private getTriggerQuery(): string {
        return this.isInputTarget() ? this.getQueryForInput() : this.getQueryForEditable();
    }

    // --- Dropdown Rendering and Scoring ---

    /**
     * Renders the suggestion dropdown based on current suggestions and query.
     * @param {Coordinates} position - The coordinates to position the dropdown.
     */
    private showDropdown(position: Coordinates): void {
        let suggestionsToShow = [...this.suggestions];
        for (const middleware of this.middlewares) {
            try {
                suggestionsToShow = middleware(suggestionsToShow);
            } catch (err) {
                this.error("Error in middleware:", err);
            }
        }
        const query = this.getTriggerQuery().toLowerCase();
        suggestionsToShow = sortAndFilterSuggestions(suggestionsToShow, query, this.minScore);
        suggestionsToShow = suggestionsToShow.slice(0, this.maxSuggestions);
        if (suggestionsToShow.length === 0) {
            this.log("No suggestions available for query:", query);
            return this.hideDropdown();
        }
        this.dropdown.innerHTML = '';
        const lineHeight = getLineHeight(this.target);
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
                } catch (err) {
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
    private hideDropdown(): void {
        this.dropdown.style.display = 'none';
    }

    /**
     * Inserts the selected tag into the target element.
     * @param {string} tag - The tag text to insert.
     */
    private insertTag(tag: string): void {
        try {
            if (this.isInputTarget()) {
                this.insertTagForTextarea(tag);
            } else {
                this.insertTagForContentEditable(tag);
            }
        } catch (err) {
            this.error("Error in insertTag:", err);
        }
    }

    /**
     * Inserts the tag into a textarea or input element.
     * @param {string} tag - The tag text to insert.
     */
    private insertTagForTextarea(tag: string): void {
        const textarea = this.target as HTMLTextAreaElement;
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
    private insertTagForContentEditable(tag: string): void {
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
    public destroy(): void {
        this.target.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('click', this.onOutsideClick.bind(this));
        document.body.removeChild(this.dropdown);
    }
}
