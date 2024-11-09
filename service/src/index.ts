import { Message, MessageWithHeader } from "@service-broker/service-broker-client";
import logger from "./common/logger";
import { asb } from "./common/service-broker";
import "./common/service-manager";
import config from "./config";
import * as vemo from "./vemo";

asb.advertise(config.service, onRequest);


async function onRequest(req: MessageWithHeader): Promise<Message> {
    const { method, args } = req.header.method ? req.header : JSON.parse(<string>req.payload)
    try {
        const result = await handleVemoCall(method, args);
        logger.debug(method, args, result)
        return {
            payload: JSON.stringify(result)
        }
    }
    catch (err) {
        logger.error(method, args, err)
        throw err
    }
}

function handleVemoCall(method: string, args: any[]) {
    switch (method) {
        case "createSession": return vemo.createSession(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionFromInvitation": return vemo.getSessionFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
