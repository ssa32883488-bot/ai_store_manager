/**
 * 与极简第三步 referenceStyleCategories 一致的参考图路径（供首页等复用）
 */
const { toAssetUrl } = require('./asset-config');

const localStylePool = [
  { id: 101, tag: '美食', imageUrl: '/images/reference-styles/美食/极简留白.jpg' },
  { id: 102, tag: '美食', imageUrl: '/images/reference-styles/美食/美食特写.jpg' },
  { id: 103, tag: '美食', imageUrl: '/images/reference-styles/美食/带手入镜.jpg' },
  { id: 104, tag: '美食', imageUrl: '/images/reference-styles/美食/服饰平铺.jpg' },
  { id: 105, tag: '美食', imageUrl: '/images/reference-styles/美食/45度微距.jpg' },
  { id: 201, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/极简平铺.jpg' },
  { id: 202, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/极简折叠.jpg' },
  { id: 203, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/局部细节特写.jpg' },
  { id: 204, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/氛围感挂拍.jpg' },
  { id: 205, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/场景化摆拍.jpg' },
  { id: 206, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/模特上身.jpg' },
  { id: 207, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/光影塑形.jpg' },
  { id: 208, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/鞋子俯视.jpg' },
  { id: 209, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/鞋子侧视.jpg' },
  { id: 210, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/鞋子细节特写.jpg' },
  { id: 211, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/鞋子氛围感.jpg' },
  { id: 212, tag: '鞋服', imageUrl: '/images/reference-styles/鞋服/上脚动态特写.jpg' },
  { id: 301, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/极简居中.jpg' },
  { id: 302, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/生活场景融入.jpg' },
  { id: 303, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/几何矩阵排列.jpg' },
  { id: 304, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/高低错落层次摆拍.jpg' },
  { id: 305, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/数码产品科技感.jpg' },
  { id: 306, tag: '生活用品', imageUrl: '/images/reference-styles/生活用品/手持产品特写.jpg' }
];

module.exports = localStylePool.map((item) => ({
  ...item,
  imageUrl: toAssetUrl(item.imageUrl)
}));
