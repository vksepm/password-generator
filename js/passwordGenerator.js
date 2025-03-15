/**
 * Password Generator Module
 * Handles all password generation logic with different strategies
 */
class PasswordGenerator {
    /**
     * Constants for character sets
     * @private
     */
    static #CHAR_SETS = {
        UPPERCASE_EASY: 'ABCDEFGHJKMNPQRSTUVWXYZ',
        UPPERCASE_ALL: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        LOWERCASE_EASY: 'abcdefghjkmnpqrstuvwxyz',
        LOWERCASE_ALL: 'abcdefghijklmnopqrstuvwxyz',
        NUMBERS_EASY: '23456789',
        NUMBERS_ALL: '0123456789',
        SYMBOLS_EASY: '!@#$%^&*()_+=-',
        SYMBOLS_ALL: '!@#$%^&*()_+=-`~[]\\{}|;\':",./<>?'
    };

    /**
     * Generates a password based on the specified options
     * @param {Object} options Password generation options
     * @returns {string} Generated password
     */
    static generatePassword(options) {
        const {
            length = 12,
            mode = 'all-characters',
            uppercase = true,
            lowercase = true,
            numbers = true,
            symbols = true
        } = options;

        if (mode === 'guid') {
            return this.#generateGUID();
        }

        return this.#generateCustomPassword(length, mode, {
            uppercase,
            lowercase,
            numbers,
            symbols
        });
    }

    /**
     * Generates a GUID
     * @private
     * @returns {string} Generated GUID
     */
    static #generateGUID() {
        try {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        } catch (error) {
            console.error('Error generating GUID:', error);
            const timestamp = new Date().getTime().toString(16);
            return `fallback-${timestamp}-${Math.random().toString(16).slice(2)}`;
        }
    }

    /**
     * Generates a custom password based on specified options
     * @private
     * @param {number} length Password length
     * @param {string} mode Password generation mode
     * @param {Object} options Character set options
     * @returns {string} Generated password
     */
    static #generateCustomPassword(length, mode, options) {
        const charset = this.#buildCharset(mode, options);
        if (!charset) {
            throw new Error('No character set selected');
        }

        const selectedTypes = this.#getSelectedTypes(options);
        const password = new Array(length);
        
        // First, ensure at least one character from each selected type
        let currentIndex = 0;
        for (const type of selectedTypes) {
            if (currentIndex < length) {
                const typeCharset = this.#getCharsetForType(type, mode);
                password[currentIndex] = this.#getRandomChar(typeCharset);
                currentIndex++;
            }
        }

        // Fill remaining positions with random characters
        while (currentIndex < length) {
            password[currentIndex] = this.#getRandomChar(charset);
            currentIndex++;
        }

        // Shuffle the password
        return this.#shuffleArray(password).join('');
    }

    /**
     * Builds the complete charset based on selected options
     * @private
     * @param {string} mode Password generation mode
     * @param {Object} options Character set options
     * @returns {string} Complete charset
     */
    static #buildCharset(mode, options) {
        let charset = '';
        const isEasyMode = mode === 'easy-to-say' || mode === 'easy-to-read';

        if (options.uppercase) {
            charset += isEasyMode ? this.#CHAR_SETS.UPPERCASE_EASY : this.#CHAR_SETS.UPPERCASE_ALL;
        }
        if (options.lowercase) {
            charset += isEasyMode ? this.#CHAR_SETS.LOWERCASE_EASY : this.#CHAR_SETS.LOWERCASE_ALL;
        }
        if (options.numbers && mode !== 'easy-to-say') {
            charset += isEasyMode ? this.#CHAR_SETS.NUMBERS_EASY : this.#CHAR_SETS.NUMBERS_ALL;
        }
        if (options.symbols && mode !== 'easy-to-say') {
            charset += isEasyMode ? this.#CHAR_SETS.SYMBOLS_EASY : this.#CHAR_SETS.SYMBOLS_ALL;
        }

        return charset;
    }

    /**
     * Gets character set for a specific type
     * @private
     * @param {string} type Character type
     * @param {string} mode Password generation mode
     * @returns {string} Character set
     */
    static #getCharsetForType(type, mode) {
        const isEasyMode = mode === 'easy-to-say' || mode === 'easy-to-read';
        switch(type) {
            case 'uppercase':
                return isEasyMode ? this.#CHAR_SETS.UPPERCASE_EASY : this.#CHAR_SETS.UPPERCASE_ALL;
            case 'lowercase':
                return isEasyMode ? this.#CHAR_SETS.LOWERCASE_EASY : this.#CHAR_SETS.LOWERCASE_ALL;
            case 'numbers':
                return isEasyMode ? this.#CHAR_SETS.NUMBERS_EASY : this.#CHAR_SETS.NUMBERS_ALL;
            case 'symbols':
                return isEasyMode ? this.#CHAR_SETS.SYMBOLS_EASY : this.#CHAR_SETS.SYMBOLS_ALL;
            default:
                return '';
        }
    }

    /**
     * Gets selected character types
     * @private
     * @param {Object} options Character set options
     * @returns {Array} Selected types
     */
    static #getSelectedTypes(options) {
        const types = [];
        if (options.uppercase) types.push('uppercase');
        if (options.lowercase) types.push('lowercase');
        if (options.numbers) types.push('numbers');
        if (options.symbols) types.push('symbols');
        return types;
    }

    /**
     * Gets a random character from a charset
     * @private
     * @param {string} charset Character set to choose from
     * @returns {string} Random character
     */
    static #getRandomChar(charset) {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        return charset.charAt(array[0] % charset.length);
    }

    /**
     * Shuffles an array using cryptographically secure random values
     * @private
     * @param {Array} array Array to shuffle
     * @returns {Array} Shuffled array
     */
    static #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = crypto.getRandomValues(new Uint8Array(1))[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Calculates password strength
     * @param {string} password Password to evaluate
     * @returns {Object} Strength details
     */
    static calculateStrength(password) {
        if (!password || password.length === 0) {
            return { score: 0, text: 'Empty' };
        }

        let score = 0;
        let text = '';

        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 1: text = 'Very Weak'; break;
            case 2: text = 'Weak'; break;
            case 3: text = 'Medium'; break;
            case 4: text = 'Strong'; break;
            case 5: text = 'Very Strong'; break;
        }

        return { score, text };
    }
}