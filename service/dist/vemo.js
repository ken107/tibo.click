"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionIdFromInvitation = exports.createInvitation = exports.getViewToken = exports.getControlToken = exports.createSession = void 0;
const config_1 = require("./config");
const twilio_1 = require("twilio");
const assert = require("assert");
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
exports.createSession = createSession;
function getControlToken(sessionId) {
    assert(sessionId, "Missing args");
    const session = sessions[sessionId];
    return session && {
        hostName: session.hostName,
        token: session.controlToken,
    };
}
exports.getControlToken = getControlToken;
function getViewToken(sessionId) {
    assert(sessionId, "Missing args");
    const session = sessions[sessionId];
    return session && {
        hostName: session.hostName,
        token: session.viewToken,
    };
}
exports.getViewToken = getViewToken;
function createInvitation(sessionId) {
    assert(sessionId, "Missing args");
    assert(sessions[sessionId], "Session not found");
    const inviteCode = generateInviteCode();
    const expires = Date.now() + config_1.default.invitationTtl;
    invitations[inviteCode] = {
        sessionId,
        isValid: () => Date.now() < expires
    };
    return inviteCode;
}
exports.createInvitation = createInvitation;
function getSessionIdFromInvitation(inviteCode) {
    assert(inviteCode, "Missing args");
    const invitation = invitations[inviteCode];
    return (invitation === null || invitation === void 0 ? void 0 : invitation.isValid()) ? invitation.sessionId : undefined;
}
exports.getSessionIdFromInvitation = getSessionIdFromInvitation;
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
