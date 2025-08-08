/**
 * K2/Nintex Universal Checkbox to Toggle Switch Converter
 * Automatically converts ALL checkboxes to Yes/No toggle switches
 * Works with any K2/Nintex form
 */

(function() {
    'use strict';
    
    // Configuration options
    const CONFIG = {
        // Set to false if you want to exclude certain checkboxes
        convertAllCheckboxes: true,
        
        // CSS classes to exclude from conversion (optional)
        excludeClasses: ['no-toggle', 'keep-checkbox'],
        
        // IDs to exclude from conversion (optional)
        excludeIds: [],
        
        // Only convert checkboxes within specific containers (optional, empty array means all)
        includeContainers: [], // e.g., ['.form-section', '.survey-questions']
        
        // Enable debug logging
        debug: true
    };
    
    // Utility function to log debug messages
    function debug(message) {
        if (CONFIG.debug) {
            console.log('K2 Toggle Converter: ' + message);
        }
    }
    
    // Check if a checkbox should be excluded from conversion
    function shouldExcludeCheckbox(checkbox) {
        // Check exclude classes
        for (let i = 0; i < CONFIG.excludeClasses.length; i++) {
            if (checkbox.classList.contains(CONFIG.excludeClasses[i])) {
                return true;
            }
        }
        
        // Check exclude IDs
        if (CONFIG.excludeIds.indexOf(checkbox.id) !== -1) {
            return true;
        }
        
        // Check if checkbox is already converted
        if (checkbox.closest('.k2-toggle-container')) {
            return true;
        }
        
        // Check if checkbox is hidden (likely a system checkbox)
        const computedStyle = window.getComputedStyle(checkbox);
        if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return true;
        }
        
        // Check if checkbox is disabled and we want to skip disabled ones
        if (checkbox.disabled && !CONFIG.convertDisabled) {
            return true;
        }
        
        return false;
    }
    
    // Check if checkbox is within allowed containers
    function isInAllowedContainer(checkbox) {
        if (CONFIG.includeContainers.length === 0) {
            return true; // No restrictions, allow all
        }
        
        for (let i = 0; i < CONFIG.includeContainers.length; i++) {
            if (checkbox.closest(CONFIG.includeContainers[i])) {
                return true;
            }
        }
        
        return false;
    }
    
    // Wait for DOM to be ready
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    // Create toggle switch HTML structure
    function createToggleSwitch(checkbox) {
        // Create wrapper container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'k2-toggle-container';
        
        // Create toggle labels container
        const toggleLabels = document.createElement('div');
        toggleLabels.className = 'k2-toggle-labels';
        
        // Create No label
        const noLabel = document.createElement('span');
        noLabel.className = 'k2-label-text k2-no-label active';
        noLabel.textContent = 'No';
        noLabel.setAttribute('data-for', checkbox.id);
        
        // Create toggle switch wrapper
        const toggleSwitch = document.createElement('div');
        toggleSwitch.className = 'k2-toggle-switch';
        
        // Create slider
        const slider = document.createElement('span');
        slider.className = 'k2-slider';
        
        // Create Yes label
        const yesLabel = document.createElement('span');
        yesLabel.className = 'k2-label-text k2-yes-label';
        yesLabel.textContent = 'Yes';
        yesLabel.setAttribute('data-for', checkbox.id);
        
        // Add click handlers to labels for accessibility
        noLabel.addEventListener('click', function() {
            if (checkbox.checked) {
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                updateLabelStates(checkbox.id);
            }
        });
        
        yesLabel.addEventListener('click', function() {
            if (!checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                updateLabelStates(checkbox.id);
            }
        });
        
        // Add change event listener to checkbox
        checkbox.addEventListener('change', function() {
            updateLabelStates(checkbox.id);
        });
        
        // Append elements
        toggleSwitch.appendChild(checkbox);
        toggleSwitch.appendChild(slider);
        
        toggleLabels.appendChild(noLabel);
        toggleLabels.appendChild(toggleSwitch);
        toggleLabels.appendChild(yesLabel);
        
        toggleContainer.appendChild(toggleLabels);
        
        return toggleContainer;
    }
    
    // Update label active states
    function updateLabelStates(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        const noLabel = document.querySelector(`[data-for="${checkboxId}"].k2-no-label`);
        const yesLabel = document.querySelector(`[data-for="${checkboxId}"].k2-yes-label`);
        
        if (checkbox && noLabel && yesLabel) {
            if (checkbox.checked) {
                noLabel.classList.remove('active');
                yesLabel.classList.add('active');
            } else {
                noLabel.classList.add('active');
                yesLabel.classList.remove('active');
            }
        }
    }
    
    // Find all checkboxes that should be converted
    function findCheckboxesToConvert() {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const checkboxesToConvert = [];
        
        for (let i = 0; i < allCheckboxes.length; i++) {
            const checkbox = allCheckboxes[i];
            
            if (!shouldExcludeCheckbox(checkbox) && isInAllowedContainer(checkbox)) {
                checkboxesToConvert.push(checkbox);
            }
        }
        
        debug(`Found ${checkboxesToConvert.length} checkboxes to convert out of ${allCheckboxes.length} total`);
        return checkboxesToConvert;
    }
    
    // Convert checkboxes to toggle switches
    function convertCheckboxes() {
        debug('Starting conversion...');
        
        const checkboxes = findCheckboxesToConvert();
        
        if (checkboxes.length === 0) {
            debug('No checkboxes found to convert');
            return;
        }
        
        let convertedCount = 0;
        
        checkboxes.forEach(function(checkbox, index) {
            try {
                debug(`Converting checkbox ${index + 1}/${checkboxes.length} (ID: ${checkbox.id || 'no-id'})`);
                
                // Ensure checkbox has an ID
                if (!checkbox.id) {
                    checkbox.id = 'k2-toggle-' + Date.now() + '-' + index;
                }
                
                // Create toggle switch
                const toggleSwitch = createToggleSwitch(checkbox);
                
                // Find the best insertion point
                let insertionPoint = checkbox.parentNode;
                
                // If checkbox is inside a label, we want to replace the whole label structure
                const parentLabel = checkbox.closest('label');
                if (parentLabel) {
                    insertionPoint = parentLabel;
                }
                
                // Insert toggle switch after the insertion point
                insertionPoint.parentNode.insertBefore(toggleSwitch, insertionPoint.nextSibling);
                
                // Hide original checkbox container but keep it for form submission
                insertionPoint.style.display = 'none';
                
                // Initialize label states
                updateLabelStates(checkbox.id);
                
                convertedCount++;
                
            } catch (error) {
                debug(`Error converting checkbox ${index + 1}: ${error.message}`);
            }
        });
        
        debug(`Successfully converted ${convertedCount} out of ${checkboxes.length} checkboxes`);
        
        // Dispatch custom event for other scripts to know conversion is complete
        const event = new CustomEvent('k2ToggleConversionComplete', {
            detail: { convertedCount: convertedCount, totalFound: checkboxes.length }
        });
        document.dispatchEvent(event);
    }
    
    // Add CSS class to theme-entry for styling
    function addThemeClass() {
        const themeEntry = document.querySelector('.theme-entry');
        if (themeEntry) {
            themeEntry.classList.add('k2-toggles-enabled');
        }
    }
    
    // Initialize the converter
    function init() {
        debug('Initializing K2 Universal Toggle Converter...');
        addThemeClass();
        convertCheckboxes();
        
        // Watch for dynamic content changes (in case K2 loads content dynamically)
        const observer = new MutationObserver(function(mutations) {
            let shouldRecheck = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any new checkboxes were added
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1) { // Element node
                            if (node.matches && node.matches('input[type="checkbox"]')) {
                                shouldRecheck = true;
                                break;
                            } else if (node.querySelector && node.querySelector('input[type="checkbox"]')) {
                                shouldRecheck = true;
                                break;
                            }
                        }
                    }
                }
            });
            
            if (shouldRecheck) {
                debug('New checkboxes detected, re-running conversion...');
                setTimeout(convertCheckboxes, 100); // Small delay to ensure content is fully loaded
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        debug('Initialization complete. Watching for dynamic content...');
    }
    
    // Start when DOM is ready
    ready(init);
    
    // Also try after a short delay in case of dynamic loading
    setTimeout(function() {
        const existingToggles = document.querySelectorAll('.k2-toggle-container').length;
        const totalCheckboxes = document.querySelectorAll('input[type="checkbox"]').length;
        
        if (existingToggles === 0 && totalCheckboxes > 0) {
            debug('Retrying conversion after delay...');
            convertCheckboxes();
        }
    }, 1000);
    
    // Expose configuration for runtime modification
    window.K2ToggleConverter = {
        config: CONFIG,
        convert: convertCheckboxes,
        debug: debug
    };
    
})();
