import * as bodyParser from "body-parser"
import * as Cors from "cors"
import * as express from "express"
import config from "./config"
import vemo from "./vemo"

const app = express();
const cors = Cors({
    origin: "vemo.app"
})

app.options("/vemo", cors)
app.post("/vemo", cors, bodyParser.json(), handleServiceRequest)
app.listen(config.listeningPort, () => console.log(`Service started on ${config.listeningPort}`))


async function handleServiceRequest(req: express.Request, res: express.Response) {
    const { method, args } = req.body;
    try {
        const handlers = <any>vemo;
        if (handlers[method]) res.json(await handlers[method].apply(vemo, args));
        else res.sendStatus(400);
    }
    catch(err) {
        console.error(method, args, err);
        res.sendStatus(500);
    }
}
