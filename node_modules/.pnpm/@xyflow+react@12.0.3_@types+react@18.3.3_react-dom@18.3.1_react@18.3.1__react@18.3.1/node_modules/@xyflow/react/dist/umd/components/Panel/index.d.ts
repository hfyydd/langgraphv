import type { HTMLAttributes, ReactNode } from 'react';
import type { PanelPosition } from '@xyflow/system';
export type PanelProps = HTMLAttributes<HTMLDivElement> & {
    /** Set position of the panel
     * @example 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
     */
    position?: PanelPosition;
    children: ReactNode;
};
export declare function Panel({ position, children, className, style, ...rest }: PanelProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=index.d.ts.map