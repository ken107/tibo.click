"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getControlToken = getControlToken;
exports.getViewToken = getViewToken;
exports.createInvitation = createInvitation;
exports.getSessionIdFromInvitation = getSessionIdFromInvitation;
const config_1 = __importDefault(require("./config"));
const twilio_1 = require("twilio");
const assert_1 = __importDefault(require("assert"));
const sessions = {};
const invitations = {};
function createSession(hostName) {
    const sessionId = generateSessionId();
    const room = sessionId;
    sessions[sessionId] = {
        hostName,
        controlToken: createVideoAccessToken(room, "control"),
        viewToken: createVideoAccessToken(room, "view")
    };
    return sessionId;
}
function getControlToken(sessionId) {
    (0, assert_1.default)(sessionId, "Missing args");
    const session = sessions[sessionId];
    return session && {
        hostName: session.hostName,
        token: session.controlToken,
    };
}
function getViewToken(sessionId) {
    (0, assert_1.default)(sessionId, "Missing args");
    const session = sessions[sessionId];
    return session && {
        hostName: session.hostName,
        token: session.viewToken,
    };
}
function createInvitation(sessionId) {
    (0, assert_1.default)(sessionId, "Missing args");
    (0, assert_1.default)(sessions[sessionId], "Session not found");
    const inviteCode = generateInviteCode();
    const expires = Date.now() + config_1.default.invitationTtl;
    invitations[inviteCode] = {
        sessionId,
        isValid: () => Date.now() < expires
    };
    return inviteCode;
}
function getSessionIdFromInvitation(inviteCode) {
    (0, assert_1.default)(inviteCode, "Missing args");
    const invitation = invitations[inviteCode];
    return invitation?.isValid() ? invitation.sessionId : undefined;
}
function generateSessionId() {
    return String(Math.random()).slice(2);
}
function generateInviteCode() {
    return 1000 + Math.floor(Math.random() * 9000);
}
function createVideoAccessToken(room, identity) {
    const token = new twilio_1.jwt.AccessToken(config_1.default.twilio.accountSid, config_1.default.twilio.videoKey, config_1.default.twilio.videoSecret, { identity });
    token.addGrant(new twilio_1.jwt.AccessToken.VideoGrant({ room }));
    return token.toJwt();
}
