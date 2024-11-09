import { MessageWithHeader } from "@service-broker/service-broker-client";
import config from "../config";
import logger from "./logger";
import sb, { asb } from "./service-broker";

let checkInTimer: NodeJS.Timeout;
const shutdownHandlers: Array<() => void|Promise<void>> = [];

sb.setServiceHandler("service-manager-client", onRequest);
if (config.siteName && config.serviceName) checkIn();



function onRequest(req: MessageWithHeader) {
  if (req.header.method == "shutdown") return remoteShutdown(req);
  else if (req.header.method == "toggleDebug") {
    config.debug = !config.debug
    logger.info("Debug is", config.debug ? "ON" : "OFF")
  }
  else throw new Error("Unknown method " + req.header.method);
}

async function remoteShutdown(req: MessageWithHeader) {
  if (req.header.pid != process.pid) throw new Error("pid incorrect");
  logger.info("Remote shutdown requested")

  for (const handler of shutdownHandlers) await handler();
  clearTimeout(checkInTimer);

  setTimeout(() => {
    sb.shutdown()
    asb.shutdown()
  }, 1000);
}

export async function shutdown() {
  for (const handler of shutdownHandlers) await handler();
  clearTimeout(checkInTimer);

  await new Promise(f => setTimeout(f, 1000))
  await Promise.all([
    sb.shutdown(),
    asb.shutdown()
  ])
}

function checkIn() {
  sb.notify({name: "service-manager"}, {
    header: {
      method: "serviceCheckIn",
      args: {
        siteName: config.siteName,
        serviceName: config.serviceName,
        pid: process.pid
      }
    }
  })
  .catch(logger.error)
  .then(() => checkInTimer = setTimeout(checkIn, 30*1000))
}


export function addShutdownHandler(handler: () => void|Promise<void>) {
  shutdownHandlers.push(handler);
}
