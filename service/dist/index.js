"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mount = void 0;
const bodyParser = require("body-parser");
const Cors = require("cors");
const express = require("express");
const config_1 = require("./config");
const vemo = require("./vemo");
if (require.main == module) {
    const app = express();
    mount(app);
    app.listen(config_1.default.listeningPort, () => console.log(`Service started on ${config_1.default.listeningPort}`));
}
function mount(app) {
    console.warn("Vemo using unrestricted cors settings");
    const cors = Cors();
    app.options("/vemo", cors);
    app.post("/vemo", cors, bodyParser.json(), handleVemoRequest);
}
exports.mount = mount;
async function handleVemoRequest(req, res) {
    const { method, args } = req.body;
    try {
        const result = await handleVemoCall(method, args);
        res.json(result);
    }
    catch (err) {
        console.error(method, args, err);
        res.sendStatus(500);
    }
}
function handleVemoCall(method, args) {
    switch (method) {
        case "createSession": return vemo.createSession();
        case "getControlToken": return vemo.getControlToken(args[0]);
        case "getViewToken": return vemo.getViewToken(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionIdForInvitation": return vemo.getSessionIdFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
