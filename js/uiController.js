/**
 * UI Controller Module
 * Handles all DOM interactions and UI state management
 */
class UIController {
    #elements = {};
    #currentMode = 'easy-to-read';

    constructor() {
        this.#initializeElements();
        this.#bindEvents();
        this.#initializeState();
    }

    /**
     * Initialize DOM element references
     * @private
     */
    #initializeElements() {
        this.#elements = {
            passwordInput: document.getElementById('GENERATED-PASSWORD'),
            lengthInput: document.getElementById('lp-pg-password-length'),
            lengthDisplay: document.querySelector('.length-display'),
            generateButton: document.getElementById('generateButton'),
            copyButton: document.getElementById('copyButton'),
            copyLargeButton: document.querySelector('.copy-button'),
            strengthIndicator: document.querySelector('.lp-pg-generated-password__strength'),
            notification: document.getElementById('copy-notification'),
            form: document.getElementById('PG-FORM'),
            characterOptions: document.getElementById('character-options'),
            
            // Radio buttons
            radioButtons: {
                easyToSay: document.getElementById('lp-pg-easy-to-say'),
                easyToRead: document.getElementById('lp-pg-easy-to-read'),
                allCharacters: document.getElementById('lp-pg-all-characters'),
                guid: document.getElementById('lp-pg-guid')
            },
            
            // Checkboxes
            checkboxes: {
                uppercase: document.getElementById('lp-pg-uppercase'),
                lowercase: document.getElementById('lp-pg-lowercase'),
                numbers: document.getElementById('lp-pg-numbers'),
                symbols: document.getElementById('lp-pg-symbols')
            }
        };
    }

    /**
     * Bind event listeners
     * @private
     */
    #bindEvents() {
        // Length input events
        this.#elements.lengthInput.addEventListener('input', () => this.#handleLengthChange());
        
        // Button events
        this.#elements.generateButton.addEventListener('click', () => this.generateNewPassword());
        this.#elements.copyButton.addEventListener('click', () => this.copyPassword());
        this.#elements.copyLargeButton.addEventListener('click', () => this.copyPassword());
        
        // Radio button events
        Object.values(this.#elements.radioButtons).forEach(radio => {
            radio.addEventListener('change', () => this.#handleModeChange());
        });
        
        // Checkbox events with validation
        Object.values(this.#elements.checkboxes).forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (!this.#validateCheckboxChange(e.target)) {
                    e.preventDefault();
                    e.target.checked = true;
                    this.showNotification('error', 'At least one character set must be selected');
                    return;
                }
                this.generateNewPassword();
            });
        });
        
        // Form submission prevention
        this.#elements.form.addEventListener('submit', (e) => e.preventDefault());
        
        // Keyboard navigation
        this.#setupKeyboardNavigation();
    }

    /**
     * Initialize UI state
     * @private
     */
    #initializeState() {
        this.#updateCheckboxStates();
        this.#elements.characterOptions.style.display = 
            this.#elements.radioButtons.allCharacters.checked ? 'grid' : 'none';
        this.generateNewPassword();
    }

    /**
     * Set up keyboard navigation
     * @private
     */
    #setupKeyboardNavigation() {
        const interactiveElements = document.querySelectorAll('.radio-option, .checkbox-wrapper');
        interactiveElements.forEach(el => {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.querySelector('input').click();
                }
            });
        });
    }

    /**
     * Handle password length changes
     * @private
     */
    #handleLengthChange() {
        const value = this.#elements.lengthInput.value;
        this.#elements.lengthDisplay.textContent = value;
        this.#elements.lengthInput.setAttribute('aria-valuenow', value);
        this.generateNewPassword();
    }

    /**
     * Handle password generation mode changes
     * @private
     */
    #handleModeChange() {
        this.#currentMode = Array.from(Object.entries(this.#elements.radioButtons))
            .find(([_, radio]) => radio.checked)?.[0] || 'easy-to-read';
        
        this.#updateCheckboxStates();
        this.generateNewPassword();
    }

    /**
     * Update checkbox states based on current mode
     * @private
     */
    #updateCheckboxStates() {
        const mode = this.#currentMode;
        const checkboxes = this.#elements.checkboxes;
        
        // Reset all checkboxes
        Object.values(checkboxes).forEach(checkbox => {
            checkbox.disabled = false;
            checkbox.checked = true;
        });

        switch(mode) {
            case 'easy-to-say':
                checkboxes.numbers.disabled = true;
                checkboxes.symbols.disabled = true;
                checkboxes.numbers.checked = false;
                checkboxes.symbols.checked = false;
                break;
                
            case 'guid':
                Object.values(checkboxes).forEach(checkbox => {
                    checkbox.disabled = true;
                });
                checkboxes.lowercase.checked = true;
                checkboxes.numbers.checked = true;
                checkboxes.uppercase.checked = false;
                checkboxes.symbols.checked = false;
                break;
        }

        // Update ARIA attributes
        Object.values(checkboxes).forEach(checkbox => {
            checkbox.setAttribute('aria-disabled', checkbox.disabled.toString());
        });

        // Update which checkboxes can be unchecked
        this.#updateUncheckableStates();
    }

    /**
     * Update which checkboxes can be unchecked based on current state
     * @private
     */
    #updateUncheckableStates() {
        const checkboxes = this.#elements.checkboxes;
        const checkedCount = Object.values(checkboxes)
            .filter(checkbox => checkbox.checked && !checkbox.disabled).length;

        Object.values(checkboxes).forEach(checkbox => {
            if (checkbox.checked && !checkbox.disabled) {
                checkbox.setAttribute('data-can-uncheck', checkedCount > 1 ? 'true' : 'false');
            } else {
                checkbox.setAttribute('data-can-uncheck', 'true');
            }
        });
    }

    /**
     * Validate checkbox changes to prevent unchecking all options
     * @private
     * @param {HTMLInputElement} changedCheckbox The checkbox that was changed
     * @returns {boolean} Whether the change is valid
     */
    #validateCheckboxChange(changedCheckbox) {
        if (changedCheckbox.checked) {
            // After checking, update all checkboxes' states
            setTimeout(() => this.#updateUncheckableStates(), 0);
            return true;
        }

        // Count how many would be checked after this change
        const wouldBeChecked = Object.values(this.#elements.checkboxes)
            .filter(checkbox => checkbox === changedCheckbox ? 
                false : checkbox.checked && !checkbox.disabled
            ).length;

        const isValid = wouldBeChecked > 0;
        if (isValid) {
            // If valid, update states after the change
            setTimeout(() => this.#updateUncheckableStates(), 0);
        }
        return isValid;
    }

    /**
     * Generate a new password
     */
    generateNewPassword() {
        try {
            const options = {
                length: parseInt(this.#elements.lengthInput.value, 10),
                mode: this.#currentMode,
                uppercase: this.#elements.checkboxes.uppercase.checked,
                lowercase: this.#elements.checkboxes.lowercase.checked,
                numbers: this.#elements.checkboxes.numbers.checked,
                symbols: this.#elements.checkboxes.symbols.checked
            };

            const password = PasswordGenerator.generatePassword(options);
            this.#elements.passwordInput.value = password;
            this.#updateStrengthIndicator(password);
            this.#announcePasswordGenerated();
        } catch (error) {
            console.error('Error generating password:', error);
            this.showNotification('error', 'Failed to generate password. Please try again.');
        }
    }

    /**
     * Copy password to clipboard
     */
    async copyPassword() {
        try {
            await navigator.clipboard.writeText(this.#elements.passwordInput.value);
            this.showNotification('success');
        } catch (error) {
            console.error('Failed to copy password:', error);
            this.showNotification('error', 'Failed to copy password. Please try again.');
        }
    }

    /**
     * Show notification to user
     * @param {string} type Notification type ('success' or 'error')
     * @param {string} message Optional custom message
     */
    showNotification(type, message = '') {
        const notification = this.#elements.notification;
        const contentEl = notification.querySelector('.notification-content span');
        
        notification.className = 'notification ' + type;
        contentEl.textContent = message || (type === 'success' ? 'Password copied!' : 'Error occurred');
        
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    }

    /**
     * Update strength indicator
     * @private
     * @param {string} password Password to check strength for
     */
    #updateStrengthIndicator(password) {
        const { score, text } = PasswordGenerator.calculateStrength(password);
        const strengthIndicator = this.#elements.strengthIndicator;
        
        strengthIndicator.className = 'lp-pg-generated-password__strength';
        if (score > 0) {
            strengthIndicator.classList.add('strength-' + score);
        }
        
        strengthIndicator.setAttribute('aria-valuenow', score * 20);
        strengthIndicator.parentElement.setAttribute('aria-label', `Password strength: ${text}`);
    }

    /**
     * Announce password generation to screen readers
     * @private
     */
    #announcePasswordGenerated() {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = 'New password generated';
        document.body.appendChild(announcement);
        
        setTimeout(() => announcement.remove(), 1000);
    }
}