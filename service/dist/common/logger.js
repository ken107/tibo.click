"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
exports.default = new Proxy(console, {
    get(target, prop) {
        if (prop == "debug" && !config_1.default.debug)
            return () => { };
        return Reflect.get(target, prop);
    }
});
