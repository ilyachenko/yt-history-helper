import { extractChannelUrl, removeVideoFromHistory } from "./helpers";
import { createAnalyzerUI, applyFilter, filterByChannel } from "./ui";
import {
  waitForYtInitialData,
  extractVideosFromData,
  analyzeVideos,
} from "./data-extractor";
import { displayResults, updateResults } from "./results-display";

(function () {
  "use strict";

  // Expose necessary functions to window object
  window.applyFilter = applyFilter;
  window.filterByChannel = filterByChannel;
  window.extractAndAnalyzeData = extractAndAnalyzeData;
  window.removeVideoFromHistory = removeVideoFromHistory;

  // Main function to run when page is loaded
  function analyzeYouTubeHistory() {
    console.log("YouTube History Analyzer is running...");

    // Create UI elements
    createAnalyzerUI();

    // Wait for ytInitialData to be available
    waitForYtInitialData(0, updateResults);
  }

  // Extract and analyze the video data
  function extractAndAnalyzeData() {
    updateResults("Analyzing your YouTube history...");

    // Make sure ytInitialData is available
    if (!window.ytInitialData) {
      updateResults(
        "Error: YouTube data not found. Please refresh the page and try again."
      );
      return;
    }

    try {
      // Extract unique videos from ytInitialData using a Map
      const uniqueVideosMap = new Map();
      extractVideosFromData(window.ytInitialData, uniqueVideosMap);

      // Convert Map to array of videos
      const videos = Array.from(uniqueVideosMap.values());

      if (videos.length === 0) {
        updateResults(
          "No videos found in your history. Try scrolling down to load more videos."
        );
        return;
      }

      // Analyze the extracted data
      const analysis = analyzeVideos(videos);

      // Display the results
      displayResults(videos, analysis);
    } catch (err) {
      console.error("Error during analysis:", err);
      updateResults("Error during analysis: " + err.message);
    }
  }

  // Start the analyzer
  setTimeout(analyzeYouTubeHistory, 1500);
})();
