import { type KeyCode } from '@xyflow/system';
export type UseKeyPressOptions = {
    target?: Window | Document | HTMLElement | ShadowRoot | null;
    actInsideInputWithModifier?: boolean;
};
/**
 * Hook for handling key events.
 *
 * @public
 * @param param.keyCode - The key code (string or array of strings) to use
 * @param param.options - Options
 * @returns boolean
 */
export declare function useKeyPress(keyCode?: KeyCode | null, options?: UseKeyPressOptions): boolean;
//# sourceMappingURL=useKeyPress.d.ts.map