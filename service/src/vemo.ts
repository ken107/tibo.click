import config from "./config"

interface Session {
    
}

class InviteCode {
    private expires: number;
    constructor(public sessionId: string) {
        this.expires = Date.now() + config.inviteCodeTtl
    }
    isExpired(): boolean {
        return Date.now() > this.expires;
    }
}

class Vemo {
    sessions: {[id: string]: Session}
    inviteCodes: {[code: string]: InviteCode}
    constructor() {
        this.sessions = {}
        this.inviteCodes = {}
    }
    getSession(code: string) {

    }
    createSession() {
        const id = this.generateSessionId();
        this.sessions[id] = {
            
        }
    }
    generateSessionId() {
        return String(Math.random()).slice(2);
    }
    generateInviteCode() {
        return 1000 + Math.floor(Math.random() * 9000)
    }
}

export default new Vemo()
