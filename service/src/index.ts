import * as bodyParser from "body-parser"
import * as Cors from "cors"
import * as express from "express"
import config from "./config"
import * as vemo from "./vemo"

const app = express();
const cors = Cors({
    origin: "vemo.app"
})

app.options("/vemo", cors)
app.post("/vemo", cors, bodyParser.json(), handleVemoRequest)
app.listen(config.listeningPort, () => console.log(`Service started on ${config.listeningPort}`))


async function handleVemoRequest(req: express.Request, res: express.Response) {
    const { method, args } = req.body;
    try {
        const result = await handleVemoCall(method, args);
        res.json(result);
    }
    catch(err) {
        console.error(method, args, err);
        res.sendStatus(500);
    }
}

function handleVemoCall(method: string, args: any[]) {
    switch (method) {
        case "createSession": return vemo.createSession();
        case "getControlToken": return vemo.getControlToken(args[0]);
        case "getViewToken": return vemo.getViewToken(args[0]);
        case "createInvitation": return vemo.createInvitation(args[0]);
        case "getSessionIdFromInvitation": return vemo.getSessionIdFromInvitation(args[0]);
        default: throw new Error("Bad method");
    }
}
