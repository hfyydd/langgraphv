export class GlobalState {
    private static _currentFilePath: string | undefined;

    static get currentFilePath(): string | undefined {
        return this._currentFilePath;
    }

    static set currentFilePath(value: string | undefined) {
        //不为空再设置
        if (value) {
            this._currentFilePath = value;
        }
    }

    private static _graphBuilderVariable: string | null = null;

    static get graphBuilderVariable(): string | null {
        return this._graphBuilderVariable;
    }

    static set graphBuilderVariable(value: string | null) {
        this._graphBuilderVariable = value;
    }

}