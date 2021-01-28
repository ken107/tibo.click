export declare function createSession(hostName: string): string;
export declare function getControlToken(sessionId: string): {
    hostName: string;
    token: string;
} | undefined;
export declare function getViewToken(sessionId: string): {
    hostName: string;
    token: string;
} | undefined;
export declare function createInvitation(sessionId: string): number;
export declare function getSessionIdFromInvitation(inviteCode: string): string | undefined;
