"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_broker_1 = require("./common/service-broker");
require("./common/service-manager");
const config_1 = require("./config");
const vemo = require("./vemo");
service_broker_1.default.advertise(config_1.default.service, onRequest);
async function onRequest(req) {
    const { method, args } = req.header.method ? req.header : JSON.parse(req.payload);
    const result = await handleVemoCall(method, args);
    return {
        payload: JSON.stringify(result)
    };
}
function handleVemoCall(method, args) {
    switch (method) {
        case "createSession": return vemo.createSession(args[0]);
        case "getControlToken": return vemo.getControlToken(args[0]);
        case "getViewToken": return vemo.getViewToken(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionIdForInvitation": return vemo.getSessionIdFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
