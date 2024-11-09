"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, assert_1.default)(process.env.SERVICE_BROKER_URL, "Missing env SERVICE_BROKER_URL");
(0, assert_1.default)(process.env.APP_SERVICE_BROKER_URL, "Missing env APP_SERVICE_BROKER_URL");
(0, assert_1.default)(process.env.APP_SERVICE_BROKER_AUTH_TOKEN, "Missing env APP_SERVICE_BROKER_AUTH_TOKEN");
exports.default = {
    // service broker info
    serviceBrokerUrl: process.env.SERVICE_BROKER_URL,
    appServiceBrokerUrl: process.env.APP_SERVICE_BROKER_URL,
    appServiceBrokerAuthToken: process.env.APP_SERVICE_BROKER_AUTH_TOKEN,
    // service deployment info
    siteName: process.env.SITE_NAME,
    serviceName: process.env.SERVICE_NAME,
    // the service provided by this module
    service: {
        name: "tibo",
        capabilities: [
            "createSession-1.0",
            "createInvitation-1.0",
            "getSessionFromInvitation-1.0",
        ],
        priority: Number(process.env.PRIORITY || 100)
    },
    // app
    debug: ["1", "true", "yes"].includes(process.env.DEBUG || ""),
    invitationTtl: 5 * 60 * 1000,
};
