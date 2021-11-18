import * as dotenv from "dotenv"
import * as assert from "assert"

dotenv.config();

assert(process.env.SERVICE_BROKER_URL, "Missing env SERVICE_BROKER_URL")
if (!process.env.TWILIO_ACCOUNT_SID) throw "Missing env TWILIO_ACCOUNT_SID"
if (!process.env.TWILIO_VIDEO_KEY) throw "Missing env TWILIO_VIDEO_KEY"
if (!process.env.TWILIO_VIDEO_SECRET) throw "Missing env TWILIO_VIDEO_SECRET"


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
            "getControlToken-1.0",
            "getViewToken-1.0",
            "createInvitation-1.0",
            "getSessionIdForInvitation-1.0",
        ],
        priority: Number(process.env.PRIORITY || 100)
    },

    // app
    debug: ["1", "true", "yes"].includes(process.env.DEBUG || ""),
    invitationTtl: 5*60*1000,
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        videoKey: process.env.TWILIO_VIDEO_KEY,
        videoSecret: process.env.TWILIO_VIDEO_SECRET
    },
}
