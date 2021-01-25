"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
if (!process.env.TWILIO_ACCOUNT_SID)
    throw "Missing env TWILIO_ACCOUNT_SID";
if (!process.env.TWILIO_VIDEO_KEY)
    throw "Missing env TWILIO_VIDEO_KEY";
if (!process.env.TWILIO_VIDEO_SECRET)
    throw "Missing env TWILIO_VIDEO_SECRET";
const config = {
    listeningPort: Number(process.env.LISTENING_PORT || 8081),
    invitationTtl: 5 * 60 * 1000,
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        videoKey: process.env.TWILIO_VIDEO_KEY,
        videoSecret: process.env.TWILIO_VIDEO_SECRET
    }
};
exports.default = config;
