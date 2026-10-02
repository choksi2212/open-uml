/**
 * Centralized constants. Anything tunable lives here so the rest of the app
 * reads from a single source of truth instead of duplicating magic numbers.
 */

export const APP_NAME = 'Open UML';
export const APP_TAGLINE = 'Offline PlantUML editor';

// Pane layout (percent of workspace width occupied by the editor)
export const PANE_RATIO_DEFAULT = 52;
export const PANE_RATIO_MIN = 30;
export const PANE_RATIO_MAX = 75;
export const PANE_RATIO_STEP = 2;

// Debounce
export const RENDER_DEBOUNCE_MS = 300;

// Recent files
export const RECENTS_MAX = 10;

// Editor defaults
export const EDITOR_FONT_SIZE_MIN = 10;
export const EDITOR_FONT_SIZE_MAX = 28;
export const EDITOR_FONT_SIZE_DEFAULT = 14;

// Preview zoom
export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.1;
export const ZOOM_DEFAULT = 1;

// localStorage keys
export const STORAGE = {
  SOURCE: 'openuml_last_source',
  THEME: 'openuml_theme',
  EDITOR: 'openuml_editor_settings',
  PANE_RATIO: 'openuml_pane_ratio',
  DIRTY: 'openuml_dirty_files',
} as const;
