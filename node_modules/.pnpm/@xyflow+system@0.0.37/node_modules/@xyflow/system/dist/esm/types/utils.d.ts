export declare enum Position {
    Left = "left",
    Top = "top",
    Right = "right",
    Bottom = "bottom"
}
export declare const oppositePosition: {
    left: Position;
    right: Position;
    top: Position;
    bottom: Position;
};
export type XYPosition = {
    x: number;
    y: number;
};
export type XYZPosition = XYPosition & {
    z: number;
};
export type Dimensions = {
    width: number;
    height: number;
};
export type Rect = Dimensions & XYPosition;
export type Box = XYPosition & {
    x2: number;
    y2: number;
};
export type Transform = [number, number, number];
export type CoordinateExtent = [[number, number], [number, number]];
//# sourceMappingURL=utils.d.ts.map