"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalState = void 0;
class GlobalState {
    static _currentFilePath;
    static get currentFilePath() {
        return this._currentFilePath;
    }
    static set currentFilePath(value) {
        //不为空再设置
        if (value) {
            this._currentFilePath = value;
        }
    }
    static _graphBuilderVariable = null;
    static get graphBuilderVariable() {
        return this._graphBuilderVariable;
    }
    static set graphBuilderVariable(value) {
        this._graphBuilderVariable = value;
    }
}
exports.GlobalState = GlobalState;
//# sourceMappingURL=globalState.js.map