interface Config {
    listeningPort: number;
    invitationTtl: number;
    twilio: {
        accountSid: string;
        videoKey: string;
        videoSecret: string;
    };
}
declare const config: Config;
export default config;
