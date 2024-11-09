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
exports.shutdown = shutdown;
exports.addShutdownHandler = addShutdownHandler;
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
const service_broker_1 = __importStar(require("./service-broker"));
let checkInTimer;
const shutdownHandlers = [];
service_broker_1.default.setServiceHandler("service-manager-client", onRequest);
if (config_1.default.siteName && config_1.default.serviceName)
    checkIn();
function onRequest(req) {
    if (req.header.method == "shutdown")
        return remoteShutdown(req);
    else if (req.header.method == "toggleDebug") {
        config_1.default.debug = !config_1.default.debug;
        logger_1.default.info("Debug is", config_1.default.debug ? "ON" : "OFF");
    }
    else
        throw new Error("Unknown method " + req.header.method);
}
async function remoteShutdown(req) {
    if (req.header.pid != process.pid)
        throw new Error("pid incorrect");
    logger_1.default.info("Remote shutdown requested");
    for (const handler of shutdownHandlers)
        await handler();
    clearTimeout(checkInTimer);
    setTimeout(() => {
        service_broker_1.default.shutdown();
        service_broker_1.asb.shutdown();
    }, 1000);
}
async function shutdown() {
    for (const handler of shutdownHandlers)
        await handler();
    clearTimeout(checkInTimer);
    await new Promise(f => setTimeout(f, 1000));
    await Promise.all([
        service_broker_1.default.shutdown(),
        service_broker_1.asb.shutdown()
    ]);
}
function checkIn() {
    service_broker_1.default.notify({ name: "service-manager" }, {
        header: {
            method: "serviceCheckIn",
            args: {
                siteName: config_1.default.siteName,
                serviceName: config_1.default.serviceName,
                pid: process.pid
            }
        }
    })
        .catch(logger_1.default.error)
        .then(() => checkInTimer = setTimeout(checkIn, 30 * 1000));
}
function addShutdownHandler(handler) {
    shutdownHandlers.push(handler);
}
