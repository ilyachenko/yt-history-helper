// Helper function to truncate text with ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

// Apply filter to displayed videos
export function applyFilter() {
  const filterInput = document.getElementById("filter-input");
  const hideWatchedToggle = document.getElementById("hide-watched-toggle");

  if (!filterInput || !window.analyzedVideos) return;

  const filterValue = filterInput.value.toLowerCase().trim();
  const hideWatched = hideWatchedToggle && hideWatchedToggle.checked;

  // Get all video cards
  const videoCards = document.querySelectorAll(
    "#yt-history-analyzer .video-card"
  );

  let visibleCount = 0;

  // Loop through all video cards
  videoCards.forEach((card) => {
    const videoId = card.dataset.videoId;
    const video = window.analyzedVideos.find((v) => v.videoId === videoId);

    if (!video) return;

    // Check filter text match
    let shouldShow = true;
    if (filterValue) {
      shouldShow =
        video.title.toLowerCase().includes(filterValue) ||
        video.channel.toLowerCase().includes(filterValue);
    }

    // Check if we should hide fully watched videos
    if (shouldShow && hideWatched) {
      if (video.progress && video.progress.percent >= 95) {
        shouldShow = false;
      }
    }

    // Show or hide the card
    card.style.display = shouldShow ? "flex" : "none";

    if (shouldShow) visibleCount++;
  });

  // Update the filter count
  const filterCountElement = document.getElementById("filter-count");
  if (filterCountElement) {
    filterCountElement.textContent = `${visibleCount} videos`;
  }
}

// Set the filter to a specific channel name
export function filterByChannel(channelName) {
  const filterInput = document.getElementById("filter-input");
  if (filterInput) {
    filterInput.value = channelName;
    applyFilter();

    // Scroll to the top of the results
    const resultsArea = document.getElementById("analysis-results");
    if (resultsArea) {
      resultsArea.scrollTop = 0;
    }
  }
}

// Create UI for the analyzer
export function createAnalyzerUI() {
  // Create a container for our analyzer
  const container = document.createElement("div");
  container.id = "yt-history-analyzer";
  container.style.position = "fixed";
  container.style.top = "70px";
  container.style.right = "20px";
  container.style.zIndex = "9999";
  container.style.background = "white";
  container.style.border = "1px solid #ccc";
  container.style.borderRadius = "8px";
  container.style.padding = "0";
  container.style.width = "400px"; // Increased width for thumbnails
  container.style.maxHeight = "80vh";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

  // Create a sticky header
  const headerContainer = document.createElement("div");
  headerContainer.style.position = "sticky";
  headerContainer.style.top = "0";
  headerContainer.style.padding = "15px 15px 10px 15px";
  headerContainer.style.backgroundColor = "white";
  headerContainer.style.borderBottom = "1px solid #eaeaea";
  headerContainer.style.borderTopLeftRadius = "8px";
  headerContainer.style.borderTopRightRadius = "8px";
  headerContainer.style.zIndex = "1";
  headerContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
  container.appendChild(headerContainer);

  // Add a header and buttons in a flex layout
  const headerTop = document.createElement("div");
  headerTop.style.display = "flex";
  headerTop.style.justifyContent = "space-between";
  headerTop.style.alignItems = "center";
  headerContainer.appendChild(headerTop);

  // Add title with truncation support
  const header = document.createElement("h3");
  header.id = "analyzer-title";
  header.textContent = "YouTube History Analyzer";
  header.style.margin = "0";
  header.style.flexGrow = "1";
  header.style.whiteSpace = "nowrap";
  header.style.overflow = "hidden";
  header.style.textOverflow = "ellipsis";
  header.style.marginRight = "10px"; // Add some space between title and buttons
  headerTop.appendChild(header);

  // Create button container for flex layout
  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.gap = "10px";
  buttonContainer.style.flexShrink = "0"; // Prevent buttons from shrinking
  headerTop.appendChild(buttonContainer);

  // Add analyze button
  const analyzeButton = document.createElement("button");
  analyzeButton.textContent = "Analyze History";
  analyzeButton.style.padding = "6px 12px";
  analyzeButton.style.cursor = "pointer";
  analyzeButton.style.backgroundColor = "#065fd4";
  analyzeButton.style.color = "white";
  analyzeButton.style.border = "none";
  analyzeButton.style.borderRadius = "3px";
  analyzeButton.style.fontWeight = "bold";
  analyzeButton.style.fontSize = "13px";
  analyzeButton.onclick = window.extractAndAnalyzeData;
  buttonContainer.appendChild(analyzeButton);

  // Add expand/collapse button
  const expandButton = document.createElement("button");
  expandButton.textContent = "Expand";
  expandButton.style.padding = "6px 12px";
  expandButton.style.cursor = "pointer";
  expandButton.style.backgroundColor = "#f0f0f0";
  expandButton.style.border = "1px solid #d3d3d3";
  expandButton.style.borderRadius = "3px";
  expandButton.style.fontSize = "13px";
  expandButton.onclick = () => {
    if (container.style.width === "400px") {
      container.style.width = "60vw";
      expandButton.textContent = "Collapse";
      // May need to adjust title display for expanded view
      updateTitleDisplay();
    } else {
      container.style.width = "400px";
      expandButton.textContent = "Expand";
      // May need to adjust title display for collapsed view
      updateTitleDisplay();
    }
  };
  buttonContainer.appendChild(expandButton);

  // Scan history button
  const scanButton = document.createElement("button");
  scanButton.textContent = "↓";
  scanButton.style.padding = "4px 8px";
  scanButton.style.cursor = "pointer";
  scanButton.style.backgroundColor = "#f0f0f0";
  scanButton.style.border = "1px solid #d3d3d3";
  scanButton.style.borderRadius = "3px";
  scanButton.style.fontWeight = "bold";
  scanButton.style.fontSize = "14px";
  scanButton.title = "Toggle Auto-Scroll";
  scanButton.dataset.scrollActive = "false";

  // Auto-scroll interval ID to track and clear when needed
  let autoScrollInterval = null;

  scanButton.onclick = function () {
    const isActive = scanButton.dataset.scrollActive === "true";

    if (!isActive) {
      // Activate auto-scroll
      scanButton.dataset.scrollActive = "true";
      scanButton.textContent = "⏸";
      scanButton.title = "Stop Auto-Scroll";

      window.extractAndAnalyzeData();
      // Initial scroll
      window.scrollTo({
        top: 999999,
        behavior: 'smooth'
      });

      // Set up interval to scroll every 3 seconds
      autoScrollInterval = setInterval(() => {
        window.extractAndAnalyzeData();
        window.scrollTo({
          top: 999999,
          behavior: 'smooth'
        });
      }, 3000);
    } else {
      // Deactivate auto-scroll
      scanButton.dataset.scrollActive = "false";
      scanButton.textContent = "↓";
      scanButton.title = "Toggle Auto-Scroll";

      // Clear the interval
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }
  };

  buttonContainer.appendChild(scanButton);

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.style.padding = "4px 8px";
  closeButton.style.cursor = "pointer";
  closeButton.style.backgroundColor = "#f44336";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.borderRadius = "3px";
  closeButton.style.fontWeight = "bold";
  closeButton.style.fontSize = "14px";
  closeButton.title = "Close Analyzer";
  closeButton.onclick = function () {
    // Remove the entire analyzer from DOM
    const analyzer = document.getElementById("yt-history-analyzer");
    if (analyzer && analyzer.parentNode) {
      analyzer.parentNode.removeChild(analyzer);
    }
  };
  buttonContainer.appendChild(closeButton);

  // Add filter container
  const filterContainer = document.createElement("div");
  filterContainer.style.marginTop = "10px";
  filterContainer.style.display = "flex";
  filterContainer.style.gap = "10px";
  filterContainer.style.alignItems = "center";
  headerContainer.appendChild(filterContainer);

  // Add filter input
  const filterInput = document.createElement("input");
  filterInput.id = "filter-input";
  filterInput.type = "text";
  filterInput.placeholder = "Filter by channel or video name...";
  filterInput.style.flexGrow = "1";
  filterInput.style.padding = "8px";
  filterInput.style.border = "1px solid #d3d3d3";
  filterInput.style.borderRadius = "3px";
  filterInput.style.fontSize = "13px";
  filterInput.addEventListener("input", window.applyFilter);
  filterContainer.appendChild(filterInput);

  // Add clear filter button
  const clearFilterButton = document.createElement("button");
  clearFilterButton.textContent = "Clear";
  clearFilterButton.style.padding = "8px 12px";
  clearFilterButton.style.cursor = "pointer";
  clearFilterButton.style.backgroundColor = "#f0f0f0";
  clearFilterButton.style.border = "1px solid #d3d3d3";
  clearFilterButton.style.borderRadius = "3px";
  clearFilterButton.style.fontSize = "13px";
  clearFilterButton.onclick = () => {
    filterInput.value = "";
    window.applyFilter();
  };
  filterContainer.appendChild(clearFilterButton);

  // Add toggle container for hide watched videos
  const toggleContainer = document.createElement("div");
  toggleContainer.style.display = "flex";
  toggleContainer.style.marginTop = "10px";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.justifyContent = "space-between";
  headerContainer.appendChild(toggleContainer);

  // Left side with checkbox and label
  const toggleLeftSide = document.createElement("div");
  toggleLeftSide.style.display = "flex";
  toggleLeftSide.style.alignItems = "center";
  toggleLeftSide.style.gap = "8px";
  toggleContainer.appendChild(toggleLeftSide);

  // Add hide watched toggle
  const hideWatchedCheckbox = document.createElement("input");
  hideWatchedCheckbox.id = "hide-watched-toggle";
  hideWatchedCheckbox.type = "checkbox";
  hideWatchedCheckbox.style.cursor = "pointer";
  hideWatchedCheckbox.addEventListener("change", () => {
    // Apply filter which will now check the toggle state
    window.applyFilter();
  });
  toggleLeftSide.appendChild(hideWatchedCheckbox);

  // Add hide watched label
  const hideWatchedLabel = document.createElement("label");
  hideWatchedLabel.htmlFor = "hide-watched-toggle";
  hideWatchedLabel.textContent = "Hide 100% watched videos";
  hideWatchedLabel.style.fontSize = "13px";
  hideWatchedLabel.style.cursor = "pointer";
  toggleLeftSide.appendChild(hideWatchedLabel);

  // Add visible videos counter on right side
  const filterCount = document.createElement("p");
  filterCount.id = "filter-count";
  filterCount.textContent = "0 videos";
  filterCount.style.margin = "0";
  filterCount.style.color = "#606060";
  filterCount.style.fontSize = "13px";
  toggleContainer.appendChild(filterCount);

  // Create content area
  const contentArea = document.createElement("div");
  contentArea.style.padding = "15px";
  contentArea.style.overflowY = "auto";
  contentArea.style.flex = "1";
  container.appendChild(contentArea);

  // Add results area
  const resultsArea = document.createElement("div");
  resultsArea.id = "analysis-results";
  contentArea.appendChild(resultsArea);

  // Add the container to the body
  document.body.appendChild(container);

  // Function to update title display based on available space
  function updateTitleDisplay() {
    const title = document.getElementById("analyzer-title");
    const fullTitle = "YouTube History Analyzer";

    // Check if we need to truncate
    if (title.scrollWidth > title.clientWidth) {
      // Truncate to fit
      let availableWidth = title.clientWidth;
      let charWidth = availableWidth / fullTitle.length;
      let visibleChars = Math.floor(availableWidth / charWidth) - 3; // -3 for ellipsis

      if (visibleChars < 5) {
        visibleChars = 5; // Minimum chars to show
      }

      title.textContent = fullTitle.substring(0, visibleChars) + "...";
      // Add full title as tooltip
      title.title = fullTitle;
    } else {
      // Reset to full title if there's enough space
      title.textContent = fullTitle;
      title.title = "";
    }
  }

  // Call once on initialization
  updateTitleDisplay();

  // Update title on window resize
  window.addEventListener("resize", updateTitleDisplay);

  // Return the update function for external use if needed
  return {
    updateTitleDisplay,
  };
}
