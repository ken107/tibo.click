"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
exports.default = new Proxy(console, {
    get(target, prop) {
        if (prop == "debug" && !config_1.default.debug)
            return () => { };
        return Reflect.get(target, prop);
    }
});
