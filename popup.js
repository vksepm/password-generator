/**
 * Initialize the password generator extension
 * This is the main entry point that sets up the UI controller
 */
(() => {
    try {
        // Wait for DOM content to be loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize UI Controller
            const ui = new UIController();
            
            // Store controller instance for potential future access
            window.__passwordGenerator = {
                ui,
                version: '1.0.0'
            };
        });
    } catch (error) {
        console.error('Failed to initialize Password Generator:', error);
        // Show error in the UI if possible
        const errorDisplay = document.createElement('div');
        errorDisplay.className = 'error-message';
        errorDisplay.textContent = 'Failed to initialize Password Generator. Please reload the extension.';
        document.body.prepend(errorDisplay);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const passwordLengthInput = document.getElementById('lp-pg-password-length');
    const lengthDisplay = document.querySelector('.length-display');
    const lengthOutput = document.getElementById('length-output');
    const generatedPasswordInput = document.getElementById('GENERATED-PASSWORD');
    const generateButton = document.getElementById('generateButton');
    const copyButton = document.getElementById('copyButton');
    const copyPasswordLargeButton = document.querySelector('.copy-button');
    const easyToSayRadio = document.getElementById('lp-pg-easy-to-say');
    const easyToReadRadio = document.getElementById('lp-pg-easy-to-read');
    const allCharactersRadio = document.getElementById('lp-pg-all-characters');
    const uppercaseCheckbox = document.getElementById('lp-pg-uppercase');
    const lowercaseCheckbox = document.getElementById('lp-pg-lowercase');
    const numbersCheckbox = document.getElementById('lp-pg-numbers');
    const symbolsCheckbox = document.getElementById('lp-pg-symbols');
    const strengthIndicator = document.querySelector('.lp-pg-generated-password__strength');
    const notification = document.getElementById('copy-notification');
    const guidRadio = document.getElementById('lp-pg-guid');
    const lengthControls = document.querySelector('.range-wrapper').parentElement;
    const characterOptions = document.getElementById('character-options');

    // Update ARIA labels for password strength
    function updatePasswordStrength(password) {
        strengthIndicator.className = 'lp-pg-generated-password__strength';
        
        if (!password || password.length === 0) {
            strengthIndicator.setAttribute('aria-valuenow', '0');
            strengthIndicator.parentElement.setAttribute('aria-label', 'Password strength: empty');
            return;
        }

        let strength = 0;
        let strengthText = '';
        
        if (password.length >= 12) {
            strength += 1;
            strengthText = 'Very Weak';
        }
        if (/[A-Z]/.test(password)) {
            strength += 1;
            strengthText = 'Weak';
        }
        if (/[a-z]/.test(password)) {
            strength += 1;
            strengthText = 'Medium';
        }
        if (/[0-9]/.test(password)) {
            strength += 1;
            strengthText = 'Strong';
        }
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 1;
            strengthText = 'Very Strong';
        }

        strengthIndicator.classList.add('strength-' + strength);
        strengthIndicator.setAttribute('aria-valuenow', strength * 20);
        strengthIndicator.parentElement.setAttribute('aria-label', `Password strength: ${strengthText}`);
    }

    // Enhance GUID generation with error handling
    function generateGUID() {
        try {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        } catch (error) {
            console.error('Error generating GUID:', error);
            // Fallback to a timestamp-based unique string if crypto fails
            const timestamp = new Date().getTime().toString(16);
            return `fallback-${timestamp}-${Math.random().toString(16).slice(2)}`;
        }
    }

    function updateCheckboxStates() {
        const isEasyToSay = easyToSayRadio.checked;
        const isEasyToRead = easyToReadRadio.checked;
        const isGUID = guidRadio.checked;
        const isAllCharacters = allCharactersRadio.checked;

        // Handle GUID length and controls
        if (isGUID) {
            passwordLengthInput.disabled = true;
            passwordLengthInput.value = 36;
            lengthDisplay.textContent = '36';
            lengthDisplay.style.opacity = '0.5';
        } else {
            passwordLengthInput.disabled = false;
            lengthDisplay.style.opacity = '1';
            
            // Reset to default length of 12 when switching from GUID
            if (passwordLengthInput.value === '36') {
                passwordLengthInput.value = 12;
                lengthDisplay.textContent = '12';
            }
        }
        
        characterOptions.style.display = 'block';

        if (isEasyToSay) {
            // Enable letters, disable numbers and symbols
            uppercaseCheckbox.disabled = false;
            lowercaseCheckbox.disabled = false;
            numbersCheckbox.disabled = true;
            symbolsCheckbox.disabled = true;
            
            // Uncheck disabled options
            numbersCheckbox.checked = false;
            symbolsCheckbox.checked = false;
            
            // Ensure at least one letter option is checked
            if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked) {
                lowercaseCheckbox.checked = true;
            }
        } else if (isEasyToRead) {
            // Enable all checkboxes
            uppercaseCheckbox.disabled = false;
            lowercaseCheckbox.disabled = false;
            numbersCheckbox.disabled = false;
            symbolsCheckbox.disabled = false;
            
            // Set default states for Easy to read
            if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked) {
                lowercaseCheckbox.checked = true;
            }
            numbersCheckbox.checked = false;
            symbolsCheckbox.checked = false;
        } else if (isGUID) {
            // GUID specific settings - all checkboxes disabled
            uppercaseCheckbox.disabled = true;
            lowercaseCheckbox.disabled = true;
            numbersCheckbox.disabled = true;
            symbolsCheckbox.disabled = true;
            
            // Set GUID checkbox states as per requirements
            uppercaseCheckbox.checked = false;
            lowercaseCheckbox.checked = true;
            numbersCheckbox.checked = true;
            symbolsCheckbox.checked = false;
        } else if (isAllCharacters) {
            // All Characters option - enable and check all checkboxes
            uppercaseCheckbox.disabled = false;
            lowercaseCheckbox.disabled = false;
            numbersCheckbox.disabled = false;
            symbolsCheckbox.disabled = false;

            // Check all checkboxes
            uppercaseCheckbox.checked = true;
            lowercaseCheckbox.checked = true;
            numbersCheckbox.checked = true;
            symbolsCheckbox.checked = true;
        }

        // Update ARIA labels based on state
        const checkboxes = document.querySelectorAll('.checkbox-input');
        checkboxes.forEach(checkbox => {
            if (checkbox.disabled) {
                checkbox.setAttribute('aria-disabled', 'true');
            } else {
                checkbox.removeAttribute('aria-disabled');
            }
        });
    }

    function generatePassword() {
        try {
            if (guidRadio.checked) {
                const guid = generateGUID();
                generatedPasswordInput.value = guid;
                updatePasswordStrength(guid);
                announcePasswordGenerated();
                return;
            }

            // For non-GUID modes, use the slider value
            let length = Math.max(1, Math.min(40, parseInt(passwordLengthInput.value, 10) || 12));
            passwordLengthInput.value = length;
            lengthDisplay.textContent = length;
            
            let charset = '';
            let password = '';

            if (easyToSayRadio.checked) {
                if (uppercaseCheckbox.checked) charset += 'ABCDEFGHJKMNPQRSTUVWXYZ';
                if (lowercaseCheckbox.checked) charset += 'abcdefghjkmnpqrstuvwxyz';
            } else if (easyToReadRadio.checked) {
                if (uppercaseCheckbox.checked) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
                if (lowercaseCheckbox.checked) charset += 'abcdefghjkmnpqrstuvwxyz';
                if (numbersCheckbox.checked) charset += '23456789';
                if (symbolsCheckbox.checked) charset += '!@#$%^&*()_+=-';
            } else {
                if (uppercaseCheckbox.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if (lowercaseCheckbox.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
                if (numbersCheckbox.checked) charset += '0123456789';
                if (symbolsCheckbox.checked) charset += '!@#$%^&*()_+=-`~[]\\{}|;\':",./<>?';
            }

            // If no charset is selected, enable lowercase as default
            if (charset.length === 0) {
                lowercaseCheckbox.checked = true;
                charset = 'abcdefghijklmnopqrstuvwxyz';
            }

            // Generate password ensuring at least one character from each selected type
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            
            // First, add one character from each selected type
            let selectedTypes = [];
            if (uppercaseCheckbox.checked) selectedTypes.push('uppercase');
            if (lowercaseCheckbox.checked) selectedTypes.push('lowercase');
            if (numbersCheckbox.checked) selectedTypes.push('numbers');
            if (symbolsCheckbox.checked) selectedTypes.push('symbols');

            let remainingLength = length;
            let tempPassword = '';

            // Add one character from each selected type
            selectedTypes.forEach(type => {
                let typeCharset = '';
                switch(type) {
                    case 'uppercase':
                        typeCharset = easyToSayRadio.checked ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                        break;
                    case 'lowercase':
                        typeCharset = easyToSayRadio.checked ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
                        break;
                    case 'numbers':
                        typeCharset = easyToReadRadio.checked ? '23456789' : '0123456789';
                        break;
                    case 'symbols':
                        typeCharset = easyToReadRadio.checked ? '!@#$%^&*()_+=-' : '!@#$%^&*()_+=-`~[]\\{}|;\':",./<>?';
                        break;
                }
                if (typeCharset) {
                    const r = crypto.getRandomValues(new Uint8Array(1))[0];
                    tempPassword += typeCharset.charAt(r % typeCharset.length);
                    remainingLength--;
                }
            });

            // Fill the rest with random characters from the full charset
            for (let i = 0; i < remainingLength; i++) {
                const r = crypto.getRandomValues(new Uint8Array(1))[0];
                tempPassword += charset.charAt(r % charset.length);
            }

            // Shuffle the password
            password = tempPassword.split('').sort(() => {
                return crypto.getRandomValues(new Uint8Array(1))[0] - 128;
            }).join('');

            generatedPasswordInput.value = password;
            updatePasswordStrength(password);
            announcePasswordGenerated();
        } catch (error) {
            console.error('Error generating password:', error);
            showError('Failed to generate password. Please try again.');
        }
    }

    // Enhance copy feedback
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(generatedPasswordInput.value);
            showNotification('success');
        } catch (err) {
            console.error('Failed to copy text:', err);
            showError('Failed to copy password. Please try again.');
        }
    }

    // Improved notification system
    function showNotification(type, message = '') {
        const notificationEl = document.getElementById('copy-notification');
        const contentEl = notificationEl.querySelector('.notification-content span');
        
        notificationEl.className = 'notification ' + type;
        if (message) {
            contentEl.textContent = message;
        } else {
            contentEl.textContent = type === 'success' ? 'Password copied!' : 'Error occurred';
        }
        
        notificationEl.classList.add('show');
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 2000);
    }

    function showError(message) {
        showNotification('error', message);
    }

    // Accessibility announcements
    function announcePasswordGenerated() {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = 'New password generated';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Update aria-valuenow when changing password length
    passwordLengthInput.addEventListener('input', function(e) {
        lengthDisplay.textContent = e.target.value;
        this.setAttribute('aria-valuenow', e.target.value);
        generatePassword();
    });

    // Keyboard navigation improvements
    document.querySelectorAll('.radio-option, .checkbox-wrapper').forEach(el => {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.querySelector('input').click();
            }
        });
    });

    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyToClipboard);
    copyPasswordLargeButton.addEventListener('click', copyToClipboard);

    // Radio and checkbox event listeners
    [easyToSayRadio, easyToReadRadio, allCharactersRadio, guidRadio].forEach(radio => {
        radio.addEventListener('change', function() {
            updateCheckboxStates();
            generatePassword();
        });
    });

    [uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });

    // Prevent form submission
    document.getElementById('PG-FORM').addEventListener('submit', (e) => e.preventDefault());

    // Initial setup
    updateCheckboxStates();
    document.querySelector('.checkbox-grid').style.display = allCharactersRadio.checked ? 'grid' : 'none';
    generatePassword();
});