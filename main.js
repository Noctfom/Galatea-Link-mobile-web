/**
 * Galatea-Link Standalone Landing Page Script
 * Supports Local update.json Sync & Dynamic GitHub Releases Aggregation
 */

(function () {
  'use strict';

  // Config
  const REPO = 'Noctfom/Galatea-Link-mobile';
  const GITHUB_API_RELEASES = 'https://api.github.com/repos/' + REPO + '/releases';
  const GITHUB_API_REPO = 'https://api.github.com/repos/' + REPO;
  const LOCAL_UPDATE_JSON = './mobile/update.json';
  
  // Default Fallback URLs & Models
  const FALLBACK_VERSION = 'v0.2.2';
  const FALLBACK_APK_NAME = 'Galatea-Link-mobile-v0.2.2-universal.apk';
  const FALLBACK_GITHUB_URL = 'https://github.com/' + REPO + '/releases/latest/download/' + FALLBACK_APK_NAME;
  const FALLBACK_RELEASE_PAGE = 'https://github.com/' + REPO + '/releases';

  // Initial built-in fallback GKG model list (ensures zero empty state)
  const FALLBACK_GKG_MODELS = [
    {
      name: 'GalateaV3_t800.gkg',
      size: 244479517,
      download_url: 'https://github.com/Noctfom/Galatea-Link-mobile/releases/download/v0.2.1/GalateaV3_t800.gkg',
      release_tag: 'v0.2.1',
      published_at: '2026-09-13T00:00:00Z'
    }
  ];

  // Upstream cards.cdb official raw link
  const CDB_RAW_GITHUB = 'https://raw.githubusercontent.com/mycard/ygopro-database/master/locales/zh-CN/cards.cdb';

  // Domestic Mirror Proxy prefix
  const FAST_MIRROR_PREFIX = 'https://ghfast.top/';

  // State
  let currentChannel = 'mirror'; // 'mirror' | 'github'
  let latestApkUrl = FALLBACK_GITHUB_URL;
  let currentVersion = FALLBACK_VERSION;
  let currentGkgAssets = FALLBACK_GKG_MODELS;

  // DOM Elements
  const mainDownloadBtn = document.getElementById('main-download-btn');
  const channelMirrorBtn = document.getElementById('channel-mirror-btn');
  const channelGithubBtn = document.getElementById('channel-github-btn');
  const heroTagVersion = document.getElementById('hero-tag-version');
  const downloadAssetMeta = document.getElementById('download-asset-meta');
  const starCountBadge = document.getElementById('github-star-count');
  const cdbDownloadBtn = document.getElementById('cdb-download-btn');
  const gkgModelsList = document.getElementById('gkg-models-list');
  const gkgCountBadge = document.getElementById('gkg-count-badge');
  const gkgSyncStatus = document.getElementById('gkg-sync-status');

  // QR Modal Elements
  const qrModal = document.getElementById('qr-modal');
  const openQrBtn = document.getElementById('open-qr-modal-btn');
  const closeQrBtn = document.getElementById('qr-modal-close');
  const qrCodeImg = document.getElementById('qr-code-img');
  const directLinkInput = document.getElementById('apk-direct-link-input');
  const copyLinkBtn = document.getElementById('copy-direct-link-btn');

  // Helper: Parse GKG filename metadata (Protocol & Training Epochs)
  function parseGkgMetadata(filename) {
    // Protocol matching: V1, V2, V3, etc.
    const protoMatch = filename.match(/[Vv](d+)/);
    const protocol = protoMatch ? '协议 V' + protoMatch[1] : '通用协议';

    // Epoch/Rounds matching: _t800, epoch800, round800, step800, etc.
    const epochMatch = filename.match(/(?:_t|epoch|round|step|t)(d+)/i);
    const epoch = epochMatch ? epochMatch[1] + ' 轮训练' : '标准训练集';

    return { protocol, epoch };
  }

  // Compute active download URL
  function getActiveUrl(rawUrl) {
    if (!rawUrl) return FALLBACK_RELEASE_PAGE;
    if (currentChannel === 'mirror') {
      return FAST_MIRROR_PREFIX + rawUrl;
    }
    return rawUrl;
  }

  // Render Dynamic GKG Model List
  function renderGkgModels(assets) {
    if (!gkgModelsList) return;
    if (!assets || assets.length === 0) {
      assets = FALLBACK_GKG_MODELS;
    }

    currentGkgAssets = assets;
    if (gkgCountBadge) {
      gkgCountBadge.innerText = assets.length;
    }

    gkgModelsList.innerHTML = assets.map((item, index) => {
      const isFirst = index === 0;
      const { protocol, epoch } = parseGkgMetadata(item.name);
      const sizeMb = item.size ? (item.size / (1024 * 1024)).toFixed(1) + ' MB' : '标准大小';
      const dateStr = item.published_at ? item.published_at.split('T')[0] : '';
      const releaseText = item.release_tag ? '来自 Release ' + item.release_tag : '官方 Release';
      const activeDownloadUrl = getActiveUrl(item.download_url);

      return `
        <div class="gkg-model-item ${isFirst ? 'is-recommended' : ''}" data-raw-url="${item.download_url}">
          <div class="model-info-block">
            <div class="model-name-row">
              <span class="model-filename" title="${item.name}">${item.name}</span>
              ${isFirst ? '<span class="model-badge recommend">推荐基线</span>' : ''}
              <span class="model-badge protocol">${protocol}</span>
              <span class="model-badge epoch">${epoch}</span>
            </div>
            <div class="model-meta-row">
              <span class="model-size">${sizeMb}</span>
              <span class="dot-sep">·</span>
              <span class="model-release">${releaseText}</span>
              ${dateStr ? '<span class="dot-sep">·</span><span class="model-date">' + dateStr + '</span>' : ''}
            </div>
          </div>
          <div class="model-action-block">
            <a href="${activeDownloadUrl}" class="model-download-btn" target="_blank" rel="noopener" title="下载 ${item.name}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
              <span>下载模型</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update All Download Buttons (APK, cards.cdb, and all GKG models)
  function updateDownloadBtn() {
    const targetApkUrl = getActiveUrl(latestApkUrl);

    if (mainDownloadBtn) {
      mainDownloadBtn.href = targetApkUrl;
    }
    if (directLinkInput) {
      directLinkInput.value = targetApkUrl;
    }
    if (qrCodeImg && targetApkUrl) {
      qrCodeImg.src = 'https://quickchart.io/qr?text=' + encodeURIComponent(targetApkUrl) + '&size=240&margin=1';
    }

    // Update cards.cdb download link
    if (cdbDownloadBtn) {
      cdbDownloadBtn.href = getActiveUrl(CDB_RAW_GITHUB);
    }

    // Update all GKG model download links
    const modelItems = document.querySelectorAll('.gkg-model-item');
    modelItems.forEach(el => {
      const rawUrl = el.getAttribute('data-raw-url');
      const btn = el.querySelector('.model-download-btn');
      if (rawUrl && btn) {
        btn.href = getActiveUrl(rawUrl);
      }
    });
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

  // 1. Check Local update.json (Instant, reliable, no API limits)
  async function checkLocalUpdate() {
    try {
      const res = await fetch(LOCAL_UPDATE_JSON + '?t=' + Date.now());
      if (res.ok) {
        const localData = await res.json();
        if (localData.version_name) {
          currentVersion = 'v' + localData.version_name;
          if (heroTagVersion) heroTagVersion.innerText = currentVersion;
        }
        if (localData.download_url) {
          latestApkUrl = localData.download_url;
        }
        if (downloadAssetMeta) {
          downloadAssetMeta.innerText = '版本 ' + currentVersion + ' · 通用 universal.apk · 适配 Android 8.0+';
        }
        updateDownloadBtn();
      }
    } catch (e) {
      // Ignore local fetch error, fallback to GitHub
    }
  }

  // 2. Fetch All Releases across History from GitHub API
  async function fetchAllReleases() {
    try {
      const res = await fetch(GITHUB_API_RELEASES);
      if (!res.ok) throw new Error('GitHub API HTTP ' + res.status);
      const releases = await res.json();

      if (Array.isArray(releases) && releases.length > 0) {
        // Find latest APK if available
        const latestRel = releases[0];
        if (latestRel && Array.isArray(latestRel.assets)) {
          const apkAsset = latestRel.assets.find(a => a.name.endsWith('.apk'));
          if (apkAsset && apkAsset.browser_download_url) {
            latestApkUrl = apkAsset.browser_download_url;
            currentVersion = latestRel.tag_name || currentVersion;
            if (heroTagVersion) heroTagVersion.innerText = currentVersion;
            const sizeMB = (apkAsset.size / (1024 * 1024)).toFixed(1);
            if (downloadAssetMeta) {
              downloadAssetMeta.innerText = '版本 ' + currentVersion + ' · ' + sizeMB + ' MB · 适配 Android 8.0+';
            }
          }
        }

        // AGGREGATE ALL GKG MODELS ACROSS ALL RELEASES!
        const gkgAssets = [];
        releases.forEach(rel => {
          if (Array.isArray(rel.assets)) {
            rel.assets.forEach(asset => {
              if (asset.name.endsWith('.gkg') || asset.name.endsWith('.onnx')) {
                gkgAssets.push({
                  name: asset.name,
                  size: asset.size,
                  download_url: asset.browser_download_url,
                  release_tag: rel.tag_name,
                  published_at: rel.published_at || rel.created_at
                });
              }
            });
          }
        });

        if (gkgAssets.length > 0) {
          renderGkgModels(gkgAssets);
          if (gkgSyncStatus) {
            gkgSyncStatus.innerText = '● 已同步 ' + gkgAssets.length + ' 个历史模型包';
          }
        } else {
          renderGkgModels(FALLBACK_GKG_MODELS);
        }
      }
    } catch (err) {
      console.warn('Could not fetch releases from GitHub API:', err);
      // Fallback to initial models
      renderGkgModels(FALLBACK_GKG_MODELS);
      if (gkgSyncStatus) {
        gkgSyncStatus.innerText = '● 基线模型包已就绪';
      }
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
  renderGkgModels(FALLBACK_GKG_MODELS);
  updateDownloadBtn();
  checkLocalUpdate().then(fetchAllReleases);
  fetchRepoStars();
})();
