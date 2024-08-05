import type { OnViewportChange } from '@xyflow/system';
export type UseOnViewportChangeOptions = {
    onStart?: OnViewportChange;
    onChange?: OnViewportChange;
    onEnd?: OnViewportChange;
};
/**
 * Hook for registering an onViewportChange handler.
 *
 * @public
 * @param params.onStart - gets called when the viewport starts changing
 * @param params.onChange - gets called when the viewport changes
 * @param params.onEnd - gets called when the viewport stops changing
 */
export declare function useOnViewportChange({ onStart, onChange, onEnd }: UseOnViewportChangeOptions): void;
//# sourceMappingURL=useOnViewportChange.d.ts.map