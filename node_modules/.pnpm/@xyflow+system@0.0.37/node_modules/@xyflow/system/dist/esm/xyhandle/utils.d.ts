import { type HandleType, type XYPosition, type Handle, NodeLookup } from '../types';
export declare function getClosestHandle(pos: XYPosition, connectionRadius: number, handleLookup: Map<string, Handle>): Handle | null;
type GetHandleLookupParams = {
    nodeLookup: NodeLookup;
    nodeId: string;
    handleId: string | null;
    handleType: HandleType;
};
export declare function getHandleLookup({ nodeLookup, nodeId, handleId, handleType, }: GetHandleLookupParams): [Map<string, Handle>, Handle];
export declare function getHandleType(edgeUpdaterType: HandleType | undefined, handleDomNode: Element | null): HandleType | null;
export declare function isConnectionValid(isInsideConnectionRadius: boolean, isHandleValid: boolean): boolean | null;
export {};
//# sourceMappingURL=utils.d.ts.map