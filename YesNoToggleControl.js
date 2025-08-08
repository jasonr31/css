function convertCheckboxesToToggles() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']");

    checkboxes.forEach(checkbox => {
        // Skip if already converted
        if (checkbox.dataset.toggleConverted === "true") return;

        // Hide original checkbox
        checkbox.style.display = "none";
        checkbox.dataset.toggleConverted = "true";

        // Create toggle container
        const toggleContainer = document.createElement("label");
        toggleContainer.className = "toggle-switch";

        // Create toggle input
        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.checked = checkbox.checked;

        // Sync toggle with original checkbox
        toggleInput.addEventListener("change", () => {
            checkbox.checked = toggleInput.checked;
            checkbox.dispatchEvent(new Event("change")); // Trigger K2 rules
        });

        // Create slider
        const slider = document.createElement("span");
        slider.className = "slider";

        // Assemble toggle
        toggleContainer.appendChild(toggleInput);
        toggleContainer.appendChild(slider);

        // Insert toggle after checkbox
        checkbox.parentNode.insertBefore(toggleContainer, checkbox.nextSibling);
        alert('running /-\|');
    });
}

// Run the function after the DOM is ready
document.addEventListener("DOMContentLoaded", convertCheckboxesToToggles);
