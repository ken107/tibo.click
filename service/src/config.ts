import assert from "assert";
import dotenv from "dotenv";

dotenv.config();

assert(process.env.SERVICE_BROKER_URL, "Missing env SERVICE_BROKER_URL")


export default {
    // service broker info
    serviceBrokerUrl: process.env.SERVICE_BROKER_URL,

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
    invitationTtl: 5*60*1000,
}
