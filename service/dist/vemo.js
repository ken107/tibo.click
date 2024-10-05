"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.createInvitation = createInvitation;
exports.getSessionFromInvitation = getSessionFromInvitation;
const config_1 = __importDefault(require("./config"));
const assert_1 = __importDefault(require("assert"));
const sessions = {};
const invitations = {};
function createSession(hostName) {
    const sessionId = generateSessionId();
    sessions[sessionId] = { sessionId, hostName };
    return sessionId;
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
function getSessionFromInvitation(inviteCode) {
    (0, assert_1.default)(inviteCode, "Missing args");
    const invitation = invitations[inviteCode];
    return invitation?.isValid() ? sessions[invitation.sessionId] : undefined;
}
function generateSessionId() {
    return String(Math.random()).slice(2);
}
function generateInviteCode() {
    return 1000 + Math.floor(Math.random() * 9000);
}
