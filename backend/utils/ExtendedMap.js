//sourced from https://stackoverflow.com/a/64409546/15648633
export default class ExtendedMap extends Map {
    constructor() {
        super()

        this.constructor.prototype.increment = function (key) {
            this.has(key) && this.set(key, this.get(key) + 1)
        }
        this.constructor.prototype.decrement = function (key) {
            this.has(key) && this.set(key, this.get(key) - 1)
        }
    }
}