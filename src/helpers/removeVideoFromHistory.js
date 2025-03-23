import { findVideoRendererById } from "./findVideoRendererById";

/**
 * Removes a video from YouTube watch history and updates the UI accordingly
 * @param {string} videoId - The ID of the video to remove
 * @param {HTMLElement} cardElement - The card element in the UI to remove
 */
export function removeVideoFromHistory(videoId, cardElement) {
  // Find the video in the DOM by ID
  const videoRenderer = findVideoRendererById(videoId);

  if (videoRenderer) {
    // Find the remove button in the ytd-video-renderer
    const removeButton = videoRenderer.querySelector(
      'ytd-button-renderer button[aria-label="Remove from watch history"]'
    );

    if (removeButton) {
      // Click the remove button
      removeButton.click();

      // Remove the card from our UI
      if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
      }

      // Also remove from our data store
      if (window.analyzedVideos) {
        window.analyzedVideos = window.analyzedVideos.filter(
          (v) => v.videoId !== videoId
        );
      }

      // Update filter count
      const filterCountElement = document.getElementById("filter-count");
      if (filterCountElement) {
        const visibleCount = document.querySelectorAll(
          '#yt-history-analyzer .video-card[style*="display: flex"]'
        ).length;
        filterCountElement.textContent = `${visibleCount} videos`;
      }

      console.log(`Removed video ${videoId} from history`);
    } else {
      console.warn(`Remove button not found for video ${videoId}`);
    }
  } else {
    console.warn(`Video renderer not found for ID ${videoId}`);
  }
}
