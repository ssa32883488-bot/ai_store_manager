/** 本地默认头像（需存在于 /images/profile/avatar.png） */
const LOCAL_AVATAR = '/images/profile/avatar.png';

/**
 * 合并用户信息：无头像、占位外链等统一回退到本地图，避免微信内域名拦截导致不显示。
 */
function normalizeUserInfo(raw) {
  if (!raw || typeof raw !== 'object') {
    return { nickname: '小店长老板娘', avatarUrl: LOCAL_AVATAR };
  }
  let avatarUrl = raw.avatarUrl;
  const s = avatarUrl != null ? String(avatarUrl).trim() : '';
  if (
    !s ||
    /via\.placeholder|placeholder\.com/i.test(s)
  ) {
    avatarUrl = LOCAL_AVATAR;
  }
  return {
    ...raw,
    nickname: raw.nickname || '小店长老板娘',
    avatarUrl
  };
}

module.exports = {
  LOCAL_AVATAR,
  normalizeUserInfo
};
