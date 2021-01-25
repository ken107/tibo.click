export declare function createSession(): string;
export declare function getControlToken(sessionId: string): string | undefined;
export declare function getViewToken(sessionId: string): string | undefined;
export declare function createInvitation(sessionId: string): number;
export declare function getSessionIdFromInvitation(inviteCode: string): string | undefined;
