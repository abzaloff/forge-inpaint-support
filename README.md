# Forge Inpaint Support

Small Forge Neo client-side extension for faster brush control in `img2img` Sketch, Inpaint, and Inpaint Sketch.

## Installation

Install with Git:

```bash
git clone https://github.com/abzaloff/forge-inpaint-support.git extensions/forge-inpaint-support
```

Or install from the Forge Neo UI:

1. Open the `Extensions` tab.
2. Open `Install from URL`.
3. Paste `https://github.com/abzaloff/forge-inpaint-support`.
4. Click `Install`, then restart Forge Neo or reload the UI.

## Hotkeys

- `Ctrl + mouse wheel`: brush width
- `Alt + mouse wheel`: brush opacity
- `Shift + mouse wheel`: brush softness
- `F2`: eyedropper/color picker for the active Forge canvas

The extension is JavaScript-only. Forge Neo loads `javascript/forge_inpaint_support.js` automatically after restart or UI reload.
