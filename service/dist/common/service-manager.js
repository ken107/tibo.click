"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addShutdownHandler = exports.shutdown = void 0;
const config_1 = require("../config");
const logger_1 = require("./logger");
const service_broker_1 = require("./service-broker");
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
    setTimeout(() => service_broker_1.default.shutdown(), 1000);
}
async function shutdown() {
    for (const handler of shutdownHandlers)
        await handler();
    clearTimeout(checkInTimer);
    await new Promise(f => setTimeout(f, 1000));
    await service_broker_1.default.shutdown();
}
exports.shutdown = shutdown;
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
exports.addShutdownHandler = addShutdownHandler;
