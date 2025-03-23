// Helper function to find a video renderer in the DOM by video ID
export function findVideoRendererById(videoId) {
    const renderers = document.querySelectorAll('ytd-video-renderer');

    for (const renderer of renderers) {
        // Look for links that contain the video ID
        const links = renderer.querySelectorAll(`a[href*="${videoId}"]`);
        if (links.length > 0) {
            return renderer;
        }
    }

    return null;
}
