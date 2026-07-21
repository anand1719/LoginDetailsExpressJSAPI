import * as appInsights from 'applicationinsights';
import { warn } from 'node:console';

const getClient = () => appInsights.defaultClient;

export const CustomLogger = {
    info: (message: string, properties?: Record<string, any>) => {
        const client = getClient();
        if (client?.trackTrace) {
            client.trackTrace({ message, properties });
        } else {
            console.log(message, properties);
        }
    },
    error: (message: string, properties?: Record<string, any>) => {
        const client = getClient();
        if (client?.trackTrace) {
            client.trackTrace({ message, properties });
        } else {
            console.error(message, properties);
        }
    },
    warn: (message: string, properties?: Record<string, any>) => {
        const client = getClient();
        if (client?.trackTrace) {
            client.trackTrace({ message, properties });
        } else {
            console.warn(message, properties);
        }
    }
};
