/**
 * 静态资源地址配置
 *
 * 使用方式：
 * 1) 保持 ASSET_CDN_BASE_URL 为空字符串 => 继续使用本地包内路径（默认，不改变现有逻辑）
 * 2) 填写你的云存储/ CDN 根地址 => 自动将 /images/... 转为线上地址
 * 3) 若使用云存储临时链接：填写 CLOUD_ASSET_FILEID_ROOT，页面会自动解析并缓存临时链接
 */
const ASSET_CDN_BASE_URL = '';
const CLOUD_ASSET_FILEID_ROOT = 'cloud://cloud1-6gmkdpaqcf033ff0.636c-cloud1-6gmkdpaqcf033ff0-1359543720/assets';
const TEMP_URL_MAX_AGE = 24 * 60 * 60; // 24h
const TEMP_URL_CACHE_KEY = 'assetTempUrlCacheV1';
const ASSET_DEBUG_ENABLED = false;

function debugLog(...args) {
  if (!ASSET_DEBUG_ENABLED) return;
  console.log('[asset-config]', ...args);
}

function toAssetUrl(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return assetPath;
  if (/^(https?:)?\/\//.test(assetPath)) return assetPath;
  if (assetPath.startsWith('cloud://')) return assetPath;

  const normalizedBase = (ASSET_CDN_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!normalizedBase) {
    debugLog('local-path', assetPath);
    return assetPath;
  }

  const normalizedPath = assetPath.replace(/^\/+/, '');
  const mapped = `${normalizedBase}/${encodeURI(normalizedPath)}`;
  debugLog('cdn-path', assetPath, '=>', mapped);
  return mapped;
}

function readCache() {
  try {
    return wx.getStorageSync(TEMP_URL_CACHE_KEY) || {};
  } catch (e) {
    return {};
  }
}

function writeCache(cache) {
  try {
    wx.setStorageSync(TEMP_URL_CACHE_KEY, cache || {});
  } catch (e) {
    // ignore cache write failures
  }
}

function normalizeCloudRoot() {
  return (CLOUD_ASSET_FILEID_ROOT || '').trim().replace(/\/+$/, '');
}

function buildCloudFileId(assetPath) {
  const root = normalizeCloudRoot();
  if (!root) return '';
  const normalizedPath = String(assetPath || '').replace(/^\/+/, '');
  return `${root}/${normalizedPath}`;
}

function needsTempUrl(assetPath) {
  if (!assetPath || typeof assetPath !== 'string') return false;
  if (/^(https?:)?\/\//.test(assetPath)) return false;
  if (assetPath.startsWith('cloud://')) return false;
  return !!normalizeCloudRoot() && assetPath.startsWith('/images/');
}

function parseTempUrlItem(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.tempFileURL || item.tempFileUrl || item.download_url || '';
}

function parseStatusCode(item) {
  if (!item || item.status === undefined || item.status === null) return 0;
  return Number(item.status) || 0;
}

function getTempFileURL(fileList) {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList,
      success: resolve,
      fail: reject
    });
  });
}

async function resolveAssetUrls(assetPaths) {
  const pathList = Array.from(new Set((assetPaths || []).filter(Boolean)));
  const resultMap = {};
  if (!pathList.length) return resultMap;

  const cache = readCache();
  const now = Date.now();
  const pending = [];

  pathList.forEach((path) => {
    const direct = toAssetUrl(path);
    if (!needsTempUrl(direct)) {
      resultMap[path] = direct;
      debugLog('direct-use', path, '=>', direct);
      return;
    }
    const cached = cache[path];
    if (cached && cached.url && cached.expireAt > now + 60 * 1000) {
      resultMap[path] = cached.url;
      debugLog('temp-cache-hit', path, '=>', cached.url);
      return;
    }
    pending.push(path);
  });

  if (!pending.length) return resultMap;

  try {
    const fileList = pending.map((path) => ({
      fileID: buildCloudFileId(path),
      maxAge: TEMP_URL_MAX_AGE
    }));
    const res = await getTempFileURL(fileList);
    const list = (res && res.fileList) || [];
    const expireAt = Date.now() + (TEMP_URL_MAX_AGE - 5 * 60) * 1000;

    list.forEach((item, idx) => {
      const sourcePath = pending[idx];
      const tempUrl = parseTempUrlItem(item);
      const statusCode = parseStatusCode(item);
      if (tempUrl && statusCode === 0) {
        resultMap[sourcePath] = tempUrl;
        cache[sourcePath] = { url: tempUrl, expireAt };
        debugLog('temp-fetch-ok', sourcePath, '=>', tempUrl);
      } else {
        resultMap[sourcePath] = sourcePath;
        debugLog('temp-fetch-fallback', sourcePath, 'status=', statusCode);
      }
    });
    writeCache(cache);
  } catch (e) {
    debugLog('temp-fetch-error', e && e.message ? e.message : e);
    pending.forEach((path) => {
      resultMap[path] = path;
    });
  }

  return resultMap;
}

async function resolveAssetUrl(assetPath) {
  const map = await resolveAssetUrls([assetPath]);
  return map[assetPath] || toAssetUrl(assetPath);
}

module.exports = {
  ASSET_CDN_BASE_URL,
  CLOUD_ASSET_FILEID_ROOT,
  TEMP_URL_MAX_AGE,
  ASSET_DEBUG_ENABLED,
  toAssetUrl,
  resolveAssetUrl,
  resolveAssetUrls
};
