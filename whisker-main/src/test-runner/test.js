const defaults = require('lodash.defaults');

class Test {
    constructor (props) {
        if (!props.test && props instanceof Function) {
            props = {
                test: props,
                name: props.name
            };
        }

        defaults(this, props, {
            test: () => {},
            name: null,
            description: null,
            categories: [],
            skip: false
        });
    }

    toJSON () {
        const json = {};
        for (const key of Object.keys(this)) {
            json[key] = this[key];
        }
        json.test = `(${this.test})`;
        return json;
    }
    
    fromJSON (json) {
        for (const key of Object.keys(json)) {
            this[key] = json[key];
        }
        this.test = eval(json.test);
    }

    /**
     * @returns {string} .
     */
    static get PASS () {
        return 'pass';
    }

    /**
     * @returns {string} .
     */
    static get FAIL () {
        return 'fail';
    }

    /**
     * @returns {string} .
     */
    static get ERROR () {
        return 'error';
    }

    /**
     * @returns {string} .
     */
    static get SKIP () {
        return 'skip';
    }
}

module.exports = Test;
