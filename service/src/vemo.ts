import config from "./config"
import { jwt } from "twilio"
import * as assert from "assert"

interface Session {
    controlToken: string;
    viewToken: string;
}

interface Invitation {
    sessionId: string;
    isValid: () => boolean;
}

const sessions: {[id: string]: Session|undefined} = {}
const invitations: {[code: string]: Invitation|undefined} = {}


export function createSession() {
    const sessionId = generateSessionId();
    const room = sessionId;
    sessions[sessionId] = {
        controlToken: createVideoAccessToken(room, "control"),
        viewToken: createVideoAccessToken(room, "view")
    }
    return sessionId
}

export function getControlToken(sessionId: string) {
    assert(sessionId, "Missing args");
    return sessions[sessionId]?.controlToken
}

export function getViewToken(sessionId: string) {
    assert(sessionId, "Missing args");
    return sessions[sessionId]?.viewToken
}


export function createInvitation(sessionId: string) {
    assert(sessionId, "Missing args");
    assert(sessions[sessionId], "Session not found");
    const inviteCode = generateInviteCode();
    const expires = Date.now() + config.invitationTtl
    invitations[inviteCode] = {
        sessionId,
        isValid: () => Date.now() < expires
    }
    return inviteCode;
}

export function getSessionIdFromInvitation(inviteCode: string) {
    assert(inviteCode, "Missing args");
    const invitation = invitations[inviteCode]
    return invitation?.isValid() ? invitation.sessionId : undefined
}


function generateSessionId() {
    return String(Math.random()).slice(2);
}

function generateInviteCode() {
    return 1000 + Math.floor(Math.random() * 9000);
}

function createVideoAccessToken(room: string, identity: string) {
    const token = new jwt.AccessToken(config.twilio.accountSid, config.twilio.videoKey, config.twilio.videoSecret, {identity})
    token.addGrant(new jwt.AccessToken.VideoGrant({room}))
    return token.toJwt()
}
