import sb, { Message, MessageWithHeader } from "./common/service-broker";
import "./common/service-manager";
import config from "./config";
import * as vemo from "./vemo";

sb.advertise(config.service, onRequest);


async function onRequest(req: MessageWithHeader): Promise<Message> {
    const { method, args } = req.header.method ? req.header : JSON.parse(<string>req.payload)
    const result = await handleVemoCall(method, args);
    return {
        payload: JSON.stringify(result)
    }
}

function handleVemoCall(method: string, args: any[]) {
    switch (method) {
        case "createSession": return vemo.createSession(args[0]);
        case "getControlToken": return vemo.getControlToken(args[0]);
        case "getViewToken": return vemo.getViewToken(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionIdForInvitation": return vemo.getSessionIdFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
