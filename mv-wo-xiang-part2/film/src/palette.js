// 调色板 · 从 style-reference 三张参考图取色，按「全片夜晚」压暗
// 参考：style-reference/README.md 的调色板表
export const P = {
  // 墨与线
  ink: '#232227',
  inkSoft: '#3A3540',

  // 米色墙 / 纸
  wall: '#E8D5B0',
  wallLit: '#F2E3C6',
  wallMid: '#CFB891',
  wallShade: '#A78E6C',
  wallDark: '#7E6A52',

  // 青蓝：窗、座椅
  teal: '#4E8FA3',
  tealLit: '#6FA8B8',
  tealDeep: '#2F6F82',
  tealNight: '#264F5F',
  tealShadow: '#1C3C49',
  glass: '#3E7C92',

  // 地面
  floor: '#8C625E',
  floorLit: '#A5776F',
  floorDark: '#684845',

  // 暖色
  mustard: '#D9A03F',
  mustardDim: '#A87C30',
  lamp: '#F6C97E',
  lampGlow: '#F7DDA8',

  // 冷色低饱和
  sage: '#93AE7C',
  sageDim: '#6F855D',
  pink: '#E8A0A8',
  pinkDim: '#B57880',
  lav: '#B9A6D9',
  lavDim: '#8B7BA8',

  // 角色
  orange: '#DE886D',
  orangeDim: '#B06A55',

  // 夜
  sky: '#16222F',
  sky2: '#1E3040',
  sky3: '#28414F',
  night: '#0E1720',
  nightSoft: '#182631',

  // 中性
  cream: '#F7EFDD',
  white: '#FBF6EA',
  black: '#0B0A0D',
  grey: '#6D6A6E',

  // 字幕
  subBg: '#1E2430',
  subText: '#F1D9A8',
  subEdge: '#E8D2A2',
};

// 多角色换色：形状完全一致，只换身体色
export const CAST = {
  clawd: P.orange,
  green: P.sage,
  yellow: P.mustard,
  pink: P.pink,
  lavender: P.lav,
  teal: P.teal,
  cream: '#E7C6A0',
  grey: '#9A9498',
};

export const FONT = 'NotoSansSC';