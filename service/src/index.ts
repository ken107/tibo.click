import * as bodyParser from "body-parser"
import * as Cors from "cors"
import * as express from "express"
import config from "./config"
import * as vemo from "./vemo"

if (require.main == module) {
    const app = express();
    mount(app);
    app.listen(config.listeningPort, () => console.log(`Service started on ${config.listeningPort}`))
}

export function mount(app: express.Express) {
    console.warn("Vemo using unrestricted cors settings");
    const cors = Cors();
    app.options("/vemo", cors)
    app.post("/vemo", cors, bodyParser.json(), handleVemoRequest)
}

async function handleVemoRequest(req: express.Request, res: express.Response) {
    const { method, args } = req.body;
    try {
        const result = await handleVemoCall(method, args);
        res.json(result || null);
    }
    catch(err) {
        console.error(method, args, err);
        res.sendStatus(500);
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
