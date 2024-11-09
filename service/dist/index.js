"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./common/logger"));
const service_broker_1 = require("./common/service-broker");
require("./common/service-manager");
const config_1 = __importDefault(require("./config"));
const vemo = __importStar(require("./vemo"));
service_broker_1.asb.advertise(config_1.default.service, onRequest);
async function onRequest(req) {
    const { method, args } = req.header.method ? req.header : JSON.parse(req.payload);
    try {
        const result = await handleVemoCall(method, args);
        logger_1.default.debug(method, args, result);
        return {
            payload: JSON.stringify(result)
        };
    }
    catch (err) {
        logger_1.default.error(method, args, err);
        throw err;
    }
}
function handleVemoCall(method, args) {
    switch (method) {
        case "createSession": return vemo.createSession(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionFromInvitation": return vemo.getSessionFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
