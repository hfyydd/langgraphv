import { type HTMLAttributes } from 'react';
import { type HandleProps as HandlePropsSystem, OnConnect } from '@xyflow/system';
export interface HandleProps extends HandlePropsSystem, Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    /** Callback called when connection is made */
    onConnect?: OnConnect;
}
/**
 * The Handle component is a UI element that is used to connect nodes.
 */
export declare const Handle: import("react").MemoExoticComponent<(props: HandleProps & import("react").RefAttributes<HTMLDivElement>) => JSX.Element>;
//# sourceMappingURL=index.d.ts.map