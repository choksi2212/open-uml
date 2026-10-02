import { useLocalStorage } from './useLocalStorage';
import {
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
} from '../lib/constants';

export interface EditorSettings {
  wordWrap: 'on' | 'off';
  minimap: boolean;
  fontSize: number;
}

const DEFAULTS: EditorSettings = {
  wordWrap: 'off',
  minimap: true,
  fontSize: EDITOR_FONT_SIZE_DEFAULT,
};

export function useEditorSettings() {
  const [settings, setSettings] = useLocalStorage<EditorSettings>('openuml_editor_settings', DEFAULTS);

  return {
    settings,
    toggleWordWrap: () =>
      setSettings((s) => ({ ...s, wordWrap: s.wordWrap === 'on' ? 'off' : 'on' })),
    toggleMinimap: () =>
      setSettings((s) => ({ ...s, minimap: !s.minimap })),
    increaseFontSize: () =>
      setSettings((s) => ({ ...s, fontSize: Math.min(EDITOR_FONT_SIZE_MAX, s.fontSize + 1) })),
    decreaseFontSize: () =>
      setSettings((s) => ({ ...s, fontSize: Math.max(EDITOR_FONT_SIZE_MIN, s.fontSize - 1) })),
  };
}
