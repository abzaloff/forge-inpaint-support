(function () {
    "use strict";

    const CANVAS_ROOTS = ["#img2img_sketch", "#img2maskimg", "#inpaint_sketch"];
    const STEP_BY_TOOL = {
        width: 3,
        alpha: 5,
        softness: 5,
    };

    let lastCanvasRoot = null;

    function app() {
        return typeof gradioApp === "function" ? gradioApp() : document;
    }

    function updateRangeInput(input) {
        if (typeof updateInput === "function") {
            updateInput(input);
            return;
        }

        input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function supportedCanvasRootFrom(target) {
        if (!(target instanceof Element)) return null;
        return target.closest(CANVAS_ROOTS.join(", "));
    }

    function visibleSupportedCanvasRoot() {
        for (const selector of CANVAS_ROOTS) {
            const root = app().querySelector(selector);
            if (!root) continue;

            const rect = root.getBoundingClientRect();
            const style = window.getComputedStyle(root);
            if (rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden") {
                return root;
            }
        }

        return null;
    }

    function canvasUuid(root) {
        const container = root?.querySelector("[id^='container_uuid_']");
        return container?.id.replace(/^container_/, "") || null;
    }

    function canvasInput(root, tool) {
        const uuid = canvasUuid(root);
        if (!uuid) return null;

        const inputId = {
            width: `scribbleWidth_${uuid}`,
            alpha: `scribbleAlpha_${uuid}`,
            softness: `scribbleSoftness_${uuid}`,
            color: `scribbleColor_${uuid}`,
        }[tool];

        return inputId ? document.getElementById(inputId) : null;
    }

    function recenterScribbleIndicator(root, event) {
        const uuid = canvasUuid(root);
        if (!uuid) return;

        const container = document.getElementById(`container_${uuid}`);
        const indicator = document.getElementById(`scribbleIndicator_${uuid}`);
        if (!container || !indicator) return;

        const rect = container.getBoundingClientRect();
        const width = indicator.offsetWidth;
        const height = indicator.offsetHeight;

        indicator.style.left = `${event.clientX - rect.left - width / 2}px`;
        indicator.style.top = `${event.clientY - rect.top - height / 2}px`;
    }

    function clamp(value, input) {
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        return Math.min(max, Math.max(min, value));
    }

    function adjustRange(root, tool, wheelEvent) {
        const input = canvasInput(root, tool);
        if (!input) return false;

        const current = Number(input.value || 0);
        const direction = Math.sign(wheelEvent.deltaY);
        const nextValue = clamp(current - direction * STEP_BY_TOOL[tool], input);

        input.value = String(nextValue);
        updateRangeInput(input);
        return true;
    }

    function toolFromWheelEvent(event) {
        if (event.ctrlKey) return "width";
        if (event.altKey) return "alpha";
        if (event.shiftKey) return "softness";
        return null;
    }

    async function pickColor(root) {
        const input = canvasInput(root, "color");
        if (!input) return;

        if (window.EyeDropper) {
            try {
                const result = await new window.EyeDropper().open();
                if (result?.sRGBHex) {
                    input.value = result.sRGBHex;
                    updateRangeInput(input);
                }
                return;
            } catch (error) {
                if (error?.name === "AbortError") return;
            }
        }

        input.click();
    }

    document.addEventListener(
        "pointermove",
        (event) => {
            const root = supportedCanvasRootFrom(event.target);
            if (root) lastCanvasRoot = root;
        },
        true,
    );

    document.addEventListener(
        "wheel",
        (event) => {
            const tool = toolFromWheelEvent(event);
            if (!tool) return;

            const root = supportedCanvasRootFrom(event.target);
            if (!root) return;

            if (!adjustRange(root, tool, event)) return;
            if (tool === "width") recenterScribbleIndicator(root, event);

            lastCanvasRoot = root;
            event.preventDefault();
            event.stopImmediatePropagation();
        },
        { capture: true, passive: false },
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key !== "F2" || event.repeat) return;

            const root = lastCanvasRoot || visibleSupportedCanvasRoot();
            if (!root) return;

            event.preventDefault();
            event.stopImmediatePropagation();
            pickColor(root);
        },
        true,
    );
})();
