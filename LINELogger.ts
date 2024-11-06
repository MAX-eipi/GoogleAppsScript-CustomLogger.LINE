class LINELogger implements CustomLogger {
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
        const streams: UrlFetch.Stream[] = [];
        let messageText = message.toString();
        switch (level) {
            case LogLevel.Warning:
                messageText = "Warning!\n" + messageText;
                break;
            case LogLevel.Error:
                messageText = "Error!!\n" + messageText;
                break;
        }
        const textMessage: UrlFetch_LINE.MessageObjects.TextMessage = {
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
        const streams: UrlFetch.Stream[] = [];
        const message = `Exception!!!
[Message]
${error.toString()}

[StackTrace]
\`\`\`
${error.stack}
\`\`\`
`;
        const textMessage: UrlFetch_LINE.MessageObjects.TextMessage = {
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
