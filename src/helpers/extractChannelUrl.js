// Helper function to extract channel URL
export function extractChannelUrl(videoRenderer) {
    try {
        // Try to get the channel URL from the suggested path
        if (videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl) {
            return videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl;
        }

        // Alternative path for channel URL
        if (videoRenderer.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl) {
            return videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl;
        }

        return null;
    } catch (err) {
        console.error("Error extracting channel URL:", err);
        return null;
    }
}