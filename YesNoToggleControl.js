
$(function () {
    SCPSAPI$OverrideCheckboxRender();
});

/* Override Checkbox Rendering to Toggle Switches */
function SCPSAPI$OverrideCheckboxRender() {
    const checkboxes = $(".theme-entry input[type='checkbox']");

    checkboxes.each(function () {
        const $checkbox = $(this);

        // Skip if already converted
        if ($checkbox.data("toggleConverted")) return;

        $checkbox.data("toggleConverted", true);
        $checkbox.css("display", "none");

        // Create toggle switch markup
        const $toggleContainer = $("<label>").addClass("toggle-switch");
        const $toggleInput = $("<input>").attr("type", "checkbox").prop("checked", $checkbox.prop("checked"));
        const $slider = $("<span>").addClass("slider");

        // Sync toggle with original checkbox
        $toggleInput.on("change", function () {
            $checkbox.prop("checked", this.checked).trigger("change");
        });

        $toggleContainer.append($toggleInput).append($slider);
        $checkbox.after($toggleContainer);
    });
}
