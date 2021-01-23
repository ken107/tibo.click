import * as dotenv from "dotenv"

dotenv.config();

interface Config {
    listeningPort: number;
    inviteCodeTtl: number;
}

export default <Config>{
    listeningPort: Number(process.env.LISTENING_PORT || 8081),
    inviteCodeTtl: 5*60*1000,
}
