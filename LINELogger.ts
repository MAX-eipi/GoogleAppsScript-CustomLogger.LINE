import { CustomLogger, LogLevel } from "../CustomLogger/CustomLogger";
import { UrlFetchStream } from "../UrlFetch/UrlFetch";
import { LINEMessagePushStream } from "../UrlFetch.LINE/API/Message/Push/Stream";
import { TextMessage } from "../UrlFetch.LINE/API/MessageObjects";
import { UrlFetchManager } from "../UrlFetch/UrlFetchManager";

type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]: U;
};

export class LINELogger implements CustomLogger {
    public channelAccessToken: string;
    public targetIdTable: EnumDictionary<LogLevel, string[]> = {
        [LogLevel.Debug]: [],
        [LogLevel.Info]: [],
        [LogLevel.Warning]: [],
        [LogLevel.Error]: [],
    };

    log(level: LogLevel, message): void {
        const targetIds = this.targetIdTable[level];
        if (!targetIds || targetIds.length === 0) {
            return;
        }
        const streams: UrlFetchStream[] = [];
        let messageText = message.toString();
        switch (level) {
            case LogLevel.Warning:
                messageText = "Warning!\n" + messageText;
                break;
            case LogLevel.Error:
                messageText = "Error!!\n" + messageText;
                break;
        }
        const textMessage: TextMessage = {
            type: 'text',
            text: messageText,
        };
        for (const targetId of targetIds) {
            const stream = new LINEMessagePushStream({
                channelAccessToken: this.channelAccessToken,
                to: targetId,
                messages: [textMessage],
            });
            streams.push(stream);
        }
        UrlFetchManager.execute(streams);
    }

    exception(error: Error): void {
        const targetIds = this.targetIdTable[LogLevel.Error];
        if (!targetIds || targetIds.length === 0) {
            return;
        }
        const streams: UrlFetchStream[] = [];
        const message = `Exception!!!
[Message]
${error.toString()}

[StackTrace]
\`\`\`
${error.stack}
\`\`\`
`;
        const textMessage: TextMessage = {
            type: 'text',
            text: message,
        };
        for (const targetId of targetIds) {
            const stream = new LINEMessagePushStream({
                channelAccessToken: this.channelAccessToken,
                to: targetId,
                messages: [textMessage],
            });
            streams.push(stream);
        }
        UrlFetchManager.execute(streams);
    }
}