export default class {
    /**
     * Build an encoded Facebook share URL.
     * @param params - Request parameters required by this operation.
     * @returns An encoded Facebook share URL.
     */
    shareFacebookUrl(params: {
        url?: string;
        text?: string;
        title?: string;
        summary?: string;
        subject?: string;
        body?: string;
    }): string;
    /**
     * Build the legacy Twitter intent URL for messages of at most 140 characters.
     * @param params - Request parameters required by this operation.
     * @returns An encoded intent URL, or false for missing or overlong text.
     */
    shareTwitterUrl(params: {
        url?: string;
        text?: string;
        title?: string;
        summary?: string;
        subject?: string;
        body?: string;
    }): string | false;
    /**
     * Build a legacy Google Plus URL for compatibility; the external service is discontinued.
     * @param params - Request parameters required by this operation.
     * @returns The legacy share URL, or false when no URL is supplied.
     * @deprecated Retained only to avoid silently changing older callers.
     */
    shareGooglePlusUrl(params: {
        url?: string;
        text?: string;
        title?: string;
        summary?: string;
        subject?: string;
        body?: string;
    }): string | false;
    /**
     * Build an encoded LinkedIn share URL with optional title and summary.
     * @param params - Request parameters required by this operation.
     * @returns An encoded share URL, or false when no URL is supplied.
     */
    shareLinkedInUrl(params: {
        url?: string;
        text?: string;
        title?: string;
        summary?: string;
        subject?: string;
        body?: string;
    }): string | false;
    /**
     * Build a mailto link only when both subject and body are supplied.
     * @param params - Request parameters required by this operation.
     * @returns An encoded mailto link, or false when subject or body is missing.
     */
    shareEmailUrl(params: {
        url?: string;
        text?: string;
        title?: string;
        summary?: string;
        subject?: string;
        body?: string;
    }): string | false;
}
