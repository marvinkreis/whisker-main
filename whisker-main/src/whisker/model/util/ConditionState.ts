import TestDriver from "../../../test/test-driver";

/**
 * For edge conditions that need to listen to the onMoved of a sprite this class saves them and updates the
 * onSpriteMoved on the test driver.
 * This class instance also tracks then the fulfilled checks of the registered onMoved checks.
 */
export class ConditionState {
    private testDriver: TestDriver;
    private checks: ((sprite) => void)[] = [];

    private touched: string[] = [];
    private colorTouched: string[] = [];

    /**
     * Get an instance of a condition state saver.
     * @param testDriver Instance of the test driver.
     */
    constructor(testDriver: TestDriver) {
        this.testDriver = testDriver;
    }

    /**
     * Updates the onSpriteMoved of the test driver.
     */
    _updateOnMoved(): void {
        this.testDriver.onSpriteMoved((sprite) => {
            this.checks.forEach(fun => {
                fun(sprite);
            });
        });
    }

    /**
     * Register a touching condition check for a sprite with another sprite. The check is also registered for the
     * other sprite as there have been inconsistencies.
     * @param spriteName1 Sprite's name that gets the condition check registered.
     * @param spriteName2 Name of the other sprite that the first needs to touch.
     */
    registerTouching(spriteName1: string, spriteName2: string): void {
        this._registerTouching(spriteName1, spriteName2);
        this._registerTouching(spriteName2, spriteName1);
        this._updateOnMoved();
        this._updateOnMoved();
    }

    private _registerTouching(spriteName1: string, spriteName2: string): void {
        let fun = (sprite) => {
            if (sprite.name == spriteName1 && sprite.isTouchingSprite(spriteName2)) {
                this.touched.push(this._getTouchingString(spriteName1, spriteName2));
            }
        };

        this.checks.push(fun);
        this._updateOnMoved();
    }

    /**
     * Registers a color touching condition check for a sprite with a RGB color value (as an array).
     * @param spriteName Name of the sprite that gets the check.
     * @param r RGB red value.
     * @param g RGB green value.
     * @param b RGB blue value.
     */
    registerColor(spriteName: string, r: number, g: number, b: number): void {
        let fun = (sprite) => {
            if (sprite.name == spriteName && sprite.isTouchingColor([r, g, b])) {
                this.colorTouched.push(this._getColorString(spriteName, r, g, b));
            }
        };

        this.checks.push(fun);
        this._updateOnMoved();
    }

    /**
     * Reset the thrown conditions.
     */
    resetConditionsThrown() {
        this.touched = [];
        this.colorTouched = [];
    }

    /**
     * Check whether two sprites touched in the current step and they did not in the last step.
     * @param spriteName1 Name of the first sprite.
     * @param spriteName2 Name of the second sprite.
     */
    areTouching(spriteName1: string, spriteName2: string): boolean {
        let combi1 = this._getTouchingString(spriteName1, spriteName2);
        let combi2 = this._getTouchingString(spriteName2, spriteName1);
        return (this.touched.indexOf(combi1) != -1 || this.touched.indexOf(combi2) != -1);
    }

    /**
     * Check whether a sprite is touching a color (for each step). If the sprite touched the color the step before, it
     * either has moved (so ask the thrown events) or not (ask for the current state).
     */
    isTouchingColor(spriteName: string, r: number, g: number, b: number): boolean {
        return this.colorTouched.indexOf(this._getColorString(spriteName, r, g, b)) != -1
            || this.testDriver.getSprite(spriteName).isTouchingColor([r, g, b]);
    }

    _getTouchingString(sprite1: string, sprite2: string): string {
        return sprite1 + ":" + sprite2;
    }

    _getColorString(spriteName: string, r: number, g: number, b: number): string {
        return spriteName + ":" + r + ":" + g + ":" + b;
    }
}
