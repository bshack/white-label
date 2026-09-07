/** @module app/assets/script/utility/share */
'use strict';
export default class {
    /**
     * Build an encoded Facebook share URL.
     * @param params - Request parameters required by this operation.
     * @returns An encoded Facebook share URL.
     */
    shareFacebookUrl(params) {
        return 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(params.url || '');
    }
    /**
     * Build the legacy Twitter intent URL for messages of at most 140 characters.
     * @param params - Request parameters required by this operation.
     * @returns An encoded intent URL, or false for missing or overlong text.
     */
    shareTwitterUrl(params) {
        //check if the message is the right size and that a message is definded
        if (params.text && params.text.length <= 140) {
            var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(params.text);
            // check if they passed in an url along with the message
            if (params.url) {
                url = url + '&url=' + encodeURIComponent(params.url);
            }
            // return back the full share url
            return url;
        }
        else {
            return false;
        }
    }
    /**
     * Build a legacy Google Plus URL for compatibility; the external service is discontinued.
     * @param params - Request parameters required by this operation.
     * @returns The legacy share URL, or false when no URL is supplied.
     * @deprecated Retained only to avoid silently changing older callers.
     */
    shareGooglePlusUrl(params) {
        if (!params.url) {
            return false;
        }
        return 'https://plus.google.com/share?url=' + encodeURIComponent(params.url);
    }
    /**
     * Build an encoded LinkedIn share URL with optional title and summary.
     * @param params - Request parameters required by this operation.
     * @returns An encoded share URL, or false when no URL is supplied.
     */
    shareLinkedInUrl(params) {
        // check it an url is defined
        if (params.url) {
            var url = 'https://www.linkedin.com/shareArticle?url=' + encodeURIComponent(params.url);
            // if a title is passed add it to the share url
            if (params.title) {
                url = url + '&title=' + encodeURIComponent(params.title);
            }
            if (params.summary) {
                // if a summary is passed add it to the share url
                url = url + '&summary=' + encodeURIComponent(params.summary);
            }
            // return back the full share url
            return url;
        }
        else {
            return false;
        }
    }
    /**
     * Build a mailto link only when both subject and body are supplied.
     * @param params - Request parameters required by this operation.
     * @returns An encoded mailto link, or false when subject or body is missing.
     */
    shareEmailUrl(params) {
        if (!params.subject || !params.body) {
            return false;
        }
        return 'mailto:?subject=' + encodeURIComponent(params.subject) + '&body=' + encodeURIComponent(params.body);
    }
}
;
//# sourceMappingURL=share.js.map