/**
 * Galatea-Link Standalone Landing Page Script
 */

(function () {
  'use strict';

  // Config
  const REPO = 'Noctfom/Galatea-Link-mobile';
  const GITHUB_API_LATEST = 'https://api.github.com/repos/' + REPO + '/releases/latest';
  const GITHUB_API_REPO = 'https://api.github.com/repos/' + REPO;
  
  // Default Fallback URLs in case API is ratelimited or before first formal release tag
  const FALLBACK_VERSION = 'v0.1.0+1';
  const FALLBACK_APK_NAME = 'Galatea-Link-v0.1.0+1.apk';
  const FALLBACK_GITHUB_URL = 'https://github.com/' + REPO + '/releases/latest/download/' + FALLBACK_APK_NAME;
  const FALLBACK_RELEASE_PAGE = 'https://github.com/' + REPO + '/releases';

  // Domestic Mirror Proxy prefix
  const FAST_MIRROR_PREFIX = 'https://ghfast.top/';

  // State
  let currentChannel = 'mirror'; // 'mirror' | 'github'
  let latestApkUrl = FALLBACK_GITHUB_URL;
  let currentVersion = FALLBACK_VERSION;

  // DOM Elements
  const mainDownloadBtn = document.getElementById('main-download-btn');
  const channelMirrorBtn = document.getElementById('channel-mirror-btn');
  const channelGithubBtn = document.getElementById('channel-github-btn');
  const heroTagVersion = document.getElementById('hero-tag-version');
  const downloadAssetMeta = document.getElementById('download-asset-meta');
  const starCountBadge = document.getElementById('github-star-count');

  // QR Modal Elements
  const qrModal = document.getElementById('qr-modal');
  const openQrBtn = document.getElementById('open-qr-modal-btn');
  const closeQrBtn = document.getElementById('qr-modal-close');
  const qrCodeImg = document.getElementById('qr-code-img');
  const directLinkInput = document.getElementById('apk-direct-link-input');
  const copyLinkBtn = document.getElementById('copy-direct-link-btn');

  // Compute actual download link based on selected channel
  function getActiveDownloadUrl() {
    if (!latestApkUrl) return FALLBACK_RELEASE_PAGE;
    if (currentChannel === 'mirror') {
      return FAST_MIRROR_PREFIX + latestApkUrl;
    }
    return latestApkUrl;
  }

  // Update Download Button State
  function updateDownloadBtn() {
    const targetUrl = getActiveDownloadUrl();
    if (mainDownloadBtn) {
      mainDownloadBtn.href = targetUrl;
    }
    if (directLinkInput) {
      directLinkInput.value = targetUrl;
    }
    // Update QR Code
    if (qrCodeImg && targetUrl) {
      qrCodeImg.src = 'https://quickchart.io/qr?text=' + encodeURIComponent(targetUrl) + '&size=240&margin=1';
    }
  }

  // Switch Download Channel
  function setChannel(channel) {
    currentChannel = channel;
    if (channel === 'mirror') {
      channelMirrorBtn.classList.add('active');
      channelGithubBtn.classList.remove('active');
    } else {
      channelGithubBtn.classList.add('active');
      channelMirrorBtn.classList.remove('active');
    }
    updateDownloadBtn();
  }

  // Fetch Latest Release from GitHub API
  async function fetchLatestRelease() {
    try {
      const res = await fetch(GITHUB_API_LATEST);
      if (!res.ok) throw new Error('GitHub API HTTP ' + res.status);
      const data = await res.json();

      if (data.tag_name) {
        currentVersion = data.tag_name;
        if (heroTagVersion) heroTagVersion.innerText = currentVersion;
      }

      // Find APK asset
      if (Array.isArray(data.assets) && data.assets.length > 0) {
        const apkAsset = data.assets.find(a => a.name.endsWith('.apk')) || data.assets[0];
        if (apkAsset && apkAsset.browser_download_url) {
          latestApkUrl = apkAsset.browser_download_url;
          const sizeMB = (apkAsset.size / (1024 * 1024)).toFixed(1);
          if (downloadAssetMeta) {
            downloadAssetMeta.innerText = '版本 ' + currentVersion + ' · ' + sizeMB + ' MB · 适配 Android 8.0+';
          }
        }
      } else {
        latestApkUrl = data.html_url || FALLBACK_RELEASE_PAGE;
      }
    } catch (err) {
      console.warn('Could not fetch latest release info directly from GitHub:', err);
    }
    updateDownloadBtn();
  }

  // Fetch Repo Stars
  async function fetchRepoStars() {
    try {
      const res = await fetch(GITHUB_API_REPO);
      if (res.ok) {
        const data = await res.json();
        if (data.stargazers_count !== undefined && starCountBadge) {
          starCountBadge.innerText = '★ ' + data.stargazers_count;
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  // Bind Events
  function bindEvents() {
    if (channelMirrorBtn) {
      channelMirrorBtn.addEventListener('click', () => setChannel('mirror'));
    }
    if (channelGithubBtn) {
      channelGithubBtn.addEventListener('click', () => setChannel('github'));
    }

    // Modal controls
    if (openQrBtn && qrModal) {
      openQrBtn.addEventListener('click', () => {
        qrModal.classList.add('open');
      });
    }

    if (closeQrBtn && qrModal) {
      closeQrBtn.addEventListener('click', () => {
        qrModal.classList.remove('open');
      });
    }

    if (qrModal) {
      qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
          qrModal.classList.remove('open');
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && qrModal) {
        qrModal.classList.remove('open');
      }
    });

    // Copy direct download link
    if (copyLinkBtn && directLinkInput) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(directLinkInput.value).then(() => {
          const original = copyLinkBtn.innerText;
          copyLinkBtn.innerText = '✓ 已复制';
          setTimeout(() => {
            copyLinkBtn.innerText = original;
          }, 2000);
        });
      });
    }
  }

  // Init
  bindEvents();
  updateDownloadBtn();
  fetchLatestRelease();
  fetchRepoStars();
})();
