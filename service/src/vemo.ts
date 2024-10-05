import config from "./config"
import assert from "assert"

interface Session {
    sessionId: string;
    hostName: string;
}

interface Invitation {
    sessionId: string;
    isValid: () => boolean;
}

const sessions: {[id: string]: Session|undefined} = {}
const invitations: {[code: string]: Invitation|undefined} = {}


export function createSession(hostName: string) {
    const sessionId = generateSessionId();
    sessions[sessionId] = {sessionId, hostName}
    return sessionId
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

export function getSessionFromInvitation(inviteCode: string) {
    assert(inviteCode, "Missing args");
    const invitation = invitations[inviteCode]
    return invitation?.isValid() ? sessions[invitation.sessionId] : undefined
}


function generateSessionId() {
    return String(Math.random()).slice(2);
}

function generateInviteCode() {
    return 1000 + Math.floor(Math.random() * 9000);
}
