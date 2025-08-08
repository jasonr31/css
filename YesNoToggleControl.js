document.addEventListener("DOMContentLoaded", function () {
    // Replace these IDs with the actual checkbox control IDs
    const checkboxIds = ["chkOption1", "chkOption2", "chkOption3"];

    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            // Hide original checkbox
            checkbox.style.display = "none";

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
            checkbox.parentNode.insertBefore(toggleContainer, checkbox.nextSibling);
        }
    });
});
