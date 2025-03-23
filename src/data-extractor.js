import { extractChannelUrl } from "./helpers";

// Wait for ytInitialData to be available
export function waitForYtInitialData(attempt = 0, onError) {
  if (attempt > 20) {
    console.error("Failed to find ytInitialData after multiple attempts");
    onError(
      "Error: Could not find YouTube data. Please refresh the page and try again."
    );
    return;
  }

  // Check if ytInitialData is available in window object
  if (window.ytInitialData) {
    console.log("ytInitialData found in window object");
    return;
  }

  // Look for the script tag that contains ytInitialData
  const scripts = document.querySelectorAll("script");
  for (const script of scripts) {
    if (script.textContent.includes("ytInitialData")) {
      try {
        // Extract ytInitialData from script content
        const scriptContent = script.textContent;
        const dataMatch = scriptContent.match(/var ytInitialData = (.+);/);
        if (dataMatch && dataMatch[1]) {
          window.ytInitialData = JSON.parse(dataMatch[1]);
          console.log("ytInitialData extracted from script tag");
          return;
        }
      } catch (err) {
        console.error("Error parsing ytInitialData:", err);
      }
    }
  }

  // If not found, try again after a delay
  setTimeout(() => waitForYtInitialData(attempt + 1, onError), 500);
}

// Extract videos from the ytInitialData object and store unique videos in a Map
export function extractVideosFromData(data, uniqueVideosMap) {
  try {
    // Navigate through the data structure to find video renderers
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];

    // Find the selected tab (history tab)
    const selectedTab = tabs.find((tab) => tab.tabRenderer?.selected);
    if (!selectedTab) return;

    // Get the section list contents
    const sectionContents =
      selectedTab.tabRenderer?.content?.sectionListRenderer?.contents || [];

    // Iterate through section contents to find item sections
    for (const section of sectionContents) {
      const itemSection = section.itemSectionRenderer;
      if (!itemSection) continue;

      // Iterate through the contents of each item section
      for (const item of itemSection.contents || []) {
        const videoRenderer = item.videoRenderer;
        if (!videoRenderer) continue;

        const videoId = videoRenderer.videoId;

        // Skip if we already have this video (ensures uniqueness)
        if (uniqueVideosMap.has(videoId)) continue;

        // Extract relevant information from each video renderer
        const video = {
          videoId: videoId,
          title: extractTextFromRuns(videoRenderer.title?.runs),
          thumbnailUrl: extractThumbnailUrl(videoRenderer.thumbnail),
          viewCount: videoRenderer.viewCountText?.simpleText || "N/A",
          duration: videoRenderer.lengthText?.simpleText || "N/A",
          channel:
            extractTextFromRuns(videoRenderer.ownerText?.runs) ||
            "Unknown channel",
          publishedTime: videoRenderer.publishedTimeText?.simpleText || "N/A",
          // Extract channel URL if available
          canonicalBaseUrl: extractChannelUrl(videoRenderer),
          // Extract progress data
          progress: extractProgressInfo(videoRenderer),
        };

        // Add to our map of unique videos
        uniqueVideosMap.set(videoId, video);
      }
    }
  } catch (err) {
    console.error("Error extracting videos:", err);
  }
}

// Helper function to extract text from runs array
export function extractTextFromRuns(runs) {
  if (!runs || !Array.isArray(runs)) return "";
  return runs.map((run) => run.text).join("");
}

// Helper function to extract thumbnail URL
export function extractThumbnailUrl(thumbnail) {
  if (!thumbnail || !thumbnail.thumbnails || !thumbnail.thumbnails.length)
    return "";
  // Get the highest quality thumbnail
  return thumbnail.thumbnails[thumbnail.thumbnails.length - 1].url;
}

// Helper function to extract progress information
export function extractProgressInfo(videoRenderer) {
  try {
    // Look for progress bar data
    if (videoRenderer.thumbnailOverlays) {
      for (const overlay of videoRenderer.thumbnailOverlays) {
        if (overlay.thumbnailOverlayResumePlaybackRenderer) {
          // This is a partially watched video
          // Extract percentage watched (if available)
          const percentWatched =
            overlay.thumbnailOverlayResumePlaybackRenderer
              ?.percentDurationWatched || 0;
          return {
            watched: true,
            percent: percentWatched,
          };
        }
      }
    }

    // Check for other indicators that the video was watched
    const hasWatchedBadge = Boolean(
      videoRenderer.badges?.some(
        (badge) =>
          badge.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_WATCHED"
      )
    );

    return {
      watched: hasWatchedBadge,
      percent: hasWatchedBadge ? 100 : 0,
    };
  } catch (err) {
    console.error("Error extracting progress info:", err);
    return {
      watched: false,
      percent: 0,
    };
  }
}

// Analyze the extracted videos
export function analyzeVideos(videos) {
  const analysis = {
    totalVideos: videos.length,
    watchedVideos: videos.filter((v) => v.progress && v.progress.watched)
      .length,
    completelyWatched: videos.filter(
      (v) => v.progress && v.progress.percent >= 95
    ).length,
    partiallyWatched: videos.filter(
      (v) => v.progress && v.progress.watched && v.progress.percent < 95
    ).length,
  };

  // Calculate percentages
  analysis.completelyWatchedPercent = Math.round(
    (analysis.completelyWatched / analysis.totalVideos) * 100
  );
  analysis.partiallyWatchedPercent = Math.round(
    (analysis.partiallyWatched / analysis.totalVideos) * 100
  );

  return analysis;
}
