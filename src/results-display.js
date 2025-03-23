// Create a responsive row layout for channels instead of a column list
function createChannelRowLayout(channels, parentElement) {
  // Create a flex container for the channels
  const channelsContainer = document.createElement("div");
  channelsContainer.style.display = "flex";
  channelsContainer.style.flexWrap = "wrap";
  channelsContainer.style.gap = "8px";
  channelsContainer.style.marginTop = "10px";
  channelsContainer.style.marginBottom = "15px";
  channelsContainer.style.display = "none"; // Hidden by default

  // Add each channel as a chip/badge
  channels.forEach((channel) => {
    const channelChip = document.createElement("div");
    channelChip.textContent = channel;
    channelChip.style.backgroundColor = "#f0f0f0";
    channelChip.style.border = "1px solid #ddd";
    channelChip.style.borderRadius = "16px";
    channelChip.style.padding = "4px 12px";
    channelChip.style.fontSize = "13px";
    channelChip.style.cursor = "pointer";
    channelChip.style.transition = "background-color 0.2s";

    // Add hover effect
    channelChip.addEventListener("mouseover", () => {
      channelChip.style.backgroundColor = "#e0e0e0";
    });

    channelChip.addEventListener("mouseout", () => {
      channelChip.style.backgroundColor = "#f0f0f0";
    });

    // Add click event to filter by this channel
    channelChip.addEventListener("click", () => {
      window.filterByChannel(channel);
    });

    channelsContainer.appendChild(channelChip);
  });

  parentElement.appendChild(channelsContainer);
  return channelsContainer;
}

// Update the displayResults function to use the new channel row layout
export function displayResults(videos, analysis) {
  // Store the videos for later export
  window.analyzedVideos = videos;

  const resultsArea = document.getElementById("analysis-results");
  // Clear previous content
  while (resultsArea.firstChild) {
    resultsArea.removeChild(resultsArea.firstChild);
  }

  // Add total videos count
  const statsContainer = document.createElement("div");
  statsContainer.style.display = "flex";
  statsContainer.style.marginBottom = "5px";

  // Total videos stats
  const totalP = document.createElement("p");
  const totalStrong = document.createElement("strong");
  totalStrong.textContent = "Total Unique Videos:";
  totalP.appendChild(totalStrong);
  totalP.appendChild(document.createTextNode(" " + analysis.totalVideos));
  totalP.style.margin = "0";
  statsContainer.appendChild(totalP);

  resultsArea.appendChild(statsContainer);

  // Update the filter count that's now in the toggle row
  const filterCount = document.getElementById("filter-count");
  if (filterCount) {
    filterCount.textContent = `${analysis.totalVideos} videos`;
  }

  // Add completed videos stats
  const completedP = document.createElement("p");
  const completedStrong = document.createElement("strong");
  completedStrong.textContent = "Fully Watched:";
  completedP.appendChild(completedStrong);
  completedP.appendChild(
    document.createTextNode(
      ` ${analysis.completelyWatched} (${analysis.completelyWatchedPercent}%)`
    )
  );
  resultsArea.appendChild(completedP);

  // Add partially watched videos stats
  const partialP = document.createElement("p");
  const partialStrong = document.createElement("strong");
  partialStrong.textContent = "Partially Watched:";
  partialP.appendChild(partialStrong);
  partialP.appendChild(
    document.createTextNode(
      ` ${analysis.partiallyWatched} (${analysis.partiallyWatchedPercent}%)`
    )
  );
  partialP.style.marginBottom = "15px";
  resultsArea.appendChild(partialP);

  // Create row for unique channels title and toggle
  const channelsRow = document.createElement("div");
  channelsRow.style.display = "flex";
  channelsRow.style.alignItems = "center";
  channelsRow.style.marginBottom = "5px";
  channelsRow.style.cursor = "pointer";

  // Add unique channels title
  const channelsStrong = document.createElement("strong");
  channelsStrong.textContent = "Unique Channels:";
  channelsRow.appendChild(channelsStrong);
  channelsRow.appendChild(document.createTextNode(` ${analysis.uniqueChannels.length}`));

  // Add spacer
  const spacer = document.createElement("span");
  spacer.style.flex = "1";
  channelsRow.appendChild(spacer);

  // Add plus-minus toggle
  const toggleSpan = document.createElement("span");
  toggleSpan.textContent = "+";
  toggleSpan.style.display = "inline-block";
  toggleSpan.style.width = "20px";
  toggleSpan.style.height = "20px";
  toggleSpan.style.lineHeight = "18px";
  toggleSpan.style.textAlign = "center";
  toggleSpan.style.fontWeight = "bold";
  toggleSpan.style.border = "1px solid #ccc";
  toggleSpan.style.borderRadius = "50%";
  toggleSpan.style.backgroundColor = "#f0f0f0";
  toggleSpan.style.marginLeft = "10px";
  toggleSpan.style.userSelect = "none";
  channelsRow.appendChild(toggleSpan);

  resultsArea.appendChild(channelsRow);

  // Create the channels row layout instead of a list
  const channelsContainer = createChannelRowLayout(analysis.uniqueChannels, resultsArea);

  // Toggle visibility of the channels container when clicking on the row
  channelsRow.addEventListener("click", () => {
    const isHidden = channelsContainer.style.display === "none";
    channelsContainer.style.display = isHidden ? "flex" : "none";
    toggleSpan.textContent = isHidden ? "−" : "+"; // Using minus and plus signs
  });

  // Create container for video thumbnails
  const videoGrid = document.createElement("div");
  videoGrid.style.display = "grid";
  videoGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
  videoGrid.style.gap = "10px";
  videoGrid.style.marginTop = "10px";
  videoGrid.style.marginBottom = "20px";
  resultsArea.appendChild(videoGrid);

  // Add each video to the grid
  for (const video of videos) {
    const videoCard = createVideoCard(video);
    videoGrid.appendChild(videoCard);
  }

  // Apply initial filter (for the hide watched toggle if it's checked)
  window.applyFilter();

  // Add export button
  const exportButton = document.createElement("button");
  exportButton.id = "export-data";
  exportButton.textContent = "Export as CSV";
  exportButton.style.padding = "8px 16px";
  exportButton.style.marginTop = "10px";
  exportButton.addEventListener("click", () => {
    exportAsCSV(videos);
  });
  resultsArea.appendChild(exportButton);
}

// Create a video card element
function createVideoCard(video) {
  const videoCard = document.createElement("div");
  videoCard.className = "video-card";
  videoCard.dataset.videoId = video.videoId;
  videoCard.style.border = "1px solid #ddd";
  videoCard.style.borderRadius = "8px";
  videoCard.style.overflow = "hidden";
  videoCard.style.display = "flex";
  videoCard.style.flexDirection = "column";

  // Add data attribute to help with filtering
  if (video.progress && video.progress.percent >= 95) {
    videoCard.dataset.fullyWatched = "true";
  }

  // Create thumbnail container with fixed aspect ratio
  const thumbnailContainer = document.createElement("div");
  thumbnailContainer.style.position = "relative";
  thumbnailContainer.style.paddingTop = "56.25%"; // 16:9 aspect ratio

  // Create thumbnail image
  const thumbnail = document.createElement("img");
  thumbnail.src =
    video.thumbnailUrl || "https://i.ytimg.com/vi/default/mqdefault.jpg"; // Use default if missing
  thumbnail.alt = video.title;
  thumbnail.style.position = "absolute";
  thumbnail.style.top = "0";
  thumbnail.style.left = "0";
  thumbnail.style.width = "100%";
  thumbnail.style.height = "100%";
  thumbnail.style.objectFit = "cover";
  thumbnailContainer.appendChild(thumbnail);

  // Add progress bar for videos
  if (video.duration !== "N/A") {
    const progressBarContainer = document.createElement("div");
    progressBarContainer.style.position = "absolute";
    progressBarContainer.style.bottom = "0";
    progressBarContainer.style.left = "0";
    progressBarContainer.style.width = "100%";
    progressBarContainer.style.height = "4px";
    progressBarContainer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

    const progressBar = document.createElement("div");
    progressBar.style.height = "100%";
    progressBar.style.width = `${video.progress?.percent || 0}%`;
    progressBar.style.backgroundColor = "rgba(255, 0, 0, 0.8)";
    progressBarContainer.appendChild(progressBar);

    thumbnailContainer.appendChild(progressBarContainer);
  }

  // Add duration badge
  if (video.duration !== "N/A") {
    const durationBadge = document.createElement("div");
    durationBadge.textContent = video.duration;
    durationBadge.style.position = "absolute";
    durationBadge.style.bottom = "4px";
    durationBadge.style.right = "4px";
    durationBadge.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    durationBadge.style.color = "white";
    durationBadge.style.padding = "1px 4px";
    durationBadge.style.borderRadius = "2px";
    durationBadge.style.fontSize = "12px";
    thumbnailContainer.appendChild(durationBadge);
  }

  // Add link to video
  const videoLink = document.createElement("a");
  videoLink.href = `https://www.youtube.com/watch?v=${video.videoId}`;
  videoLink.target = "_blank";
  videoLink.appendChild(thumbnailContainer);
  videoCard.appendChild(videoLink);

  // Add video info
  const infoContainer = document.createElement("div");
  infoContainer.style.padding = "8px";

  // Add title (truncated if needed)
  const title = document.createElement("div");
  title.textContent = truncateText(video.title, 60);
  title.title = video.title; // Full title on hover
  title.style.fontWeight = "bold";
  title.style.fontSize = "14px";
  title.style.marginBottom = "5px";
  title.style.lineHeight = "1.2";
  title.style.height = "2.4em";
  title.style.overflow = "hidden";
  infoContainer.appendChild(title);

  // Create container for channel info with actions
  const channelContainer = document.createElement("div");
  channelContainer.style.display = "flex";
  channelContainer.style.alignItems = "center";
  channelContainer.style.gap = "5px";
  channelContainer.style.marginBottom = "3px";

  // Add channel name with clickable style
  const channel = document.createElement("div");
  channel.textContent = video.channel;
  channel.className = "channel-name";
  channel.style.fontSize = "12px";
  channel.style.color = "#065fd4"; // Blue color to indicate it's clickable
  channel.style.cursor = "pointer";
  channel.style.textDecoration = "none";

  // Add hover effect
  channel.addEventListener("mouseover", () => {
    channel.style.textDecoration = "underline";
  });

  channel.addEventListener("mouseout", () => {
    channel.style.textDecoration = "none";
  });

  // Add click event to filter by this channel
  channel.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.filterByChannel(video.channel);
  });

  channelContainer.appendChild(channel);

  // Add button to open YouTube channel
  const channelButton = document.createElement("button");
  channelButton.title = "Open channel on YouTube";
  channelButton.textContent = "🔗"; // Unicode TV emoji as a simple icon
  channelButton.style.border = "none";
  channelButton.style.backgroundColor = "transparent";
  channelButton.style.cursor = "pointer";
  channelButton.style.padding = "2px";
  channelButton.style.display = "flex";
  channelButton.style.alignItems = "center";
  channelButton.style.justifyContent = "center";
  channelButton.style.color = "#606060";
  channelButton.style.fontSize = "12px";

  // Add hover effect
  channelButton.addEventListener("mouseover", () => {
    channelButton.style.color = "#065fd4";
  });

  channelButton.addEventListener("mouseout", () => {
    channelButton.style.color = "#606060";
  });

  // Add click event to open YouTube channel
  channelButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Open channel in new tab
    if (video.canonicalBaseUrl) {
      window.open(`https://www.youtube.com${video.canonicalBaseUrl}`, "_blank");
    } else {
      // Fallback to search if canonicalBaseUrl is not available
      const encodedChannelName = encodeURIComponent(video.channel);
      window.open(
        `https://www.youtube.com/results?search_query=${encodedChannelName}`,
        "_blank"
      );
    }
  });

  channelContainer.appendChild(channelButton);

  infoContainer.appendChild(channelContainer);

  // Add watch progress text if available
  if (video.progress && video.progress.watched) {
    const progressText = document.createElement("div");
    progressText.textContent = `Watched: ${video.progress.percent}%`;
    progressText.style.fontSize = "12px";
    progressText.style.color =
      video.progress.percent >= 95 ? "#00a000" : "#606060";
    progressText.style.marginTop = "3px";
    infoContainer.appendChild(progressText);
  }

  // Add remove button
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.style.marginTop = "5px";
  removeButton.style.padding = "2px 8px";
  removeButton.style.backgroundColor = "#f0f0f0";
  removeButton.style.border = "1px solid #ccc";
  removeButton.style.borderRadius = "3px";
  removeButton.style.cursor = "pointer";
  removeButton.style.fontSize = "12px";
  removeButton.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.removeVideoFromHistory(video.videoId, videoCard);
  };
  infoContainer.appendChild(removeButton);

  videoCard.appendChild(infoContainer);
  return videoCard;
}

// Update the results area with new content
export function updateResults(content) {
  const resultsArea = document.getElementById("analysis-results");
  if (resultsArea) {
    // Clear previous content
    while (resultsArea.firstChild) {
      resultsArea.removeChild(resultsArea.firstChild);
    }

    // If content is just a string message, display it as text
    if (typeof content === "string" && !content.startsWith("<")) {
      const textNode = document.createTextNode(content);
      resultsArea.appendChild(textNode);
      return;
    }

    // Otherwise, create DOM elements for structured content
    appendSafeHTML(resultsArea, content);
  }
}

// Safely append HTML-like content using DOM methods
function appendSafeHTML(parent, htmlString) {
  // Create a temporary div to parse the HTML-like string
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const nodes = doc.body.childNodes;

  // Process each node and create proper DOM elements
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // Handle different node types
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(document.createTextNode(node.textContent));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Create the element
      const newElement = document.createElement(node.tagName);

      // Copy attributes
      Array.from(node.attributes).forEach((attr) => {
        newElement.setAttribute(attr.name, attr.value);
      });

      // Handle special case for adding event listeners
      if (
        node.tagName.toLowerCase() === "button" &&
        node.id === "export-data"
      ) {
        newElement.addEventListener("click", () => {
          exportAsCSV(window.analyzedVideos || []);
        });
      }

      // Process children recursively
      appendSafeHTML(newElement, node.innerHTML);

      // Add to parent
      parent.appendChild(newElement);
    }
  }
}

// Export video data as CSV
export function exportAsCSV(videos) {
  // Create CSV header
  let csv = "Video ID,Title,Channel,Duration,View Count,Progress (%)\n";

  // Add each video as a row
  for (const video of videos) {
    // Format each field and escape commas and quotes
    const row = [
      video.videoId,
      `"${video.title.replace(/"/g, '""')}"`, // Escape quotes in title
      `"${video.channel.replace(/"/g, '""')}"`, // Escape quotes in channel
      video.duration,
      video.viewCount,
      video.progress?.percent || 0,
    ];

    csv += row.join(",") + "\n";
  }

  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Create a link to download the CSV file
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "youtube_history.csv");
  link.style.display = "none";

  // Add the link to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to truncate text with ellipsis
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
