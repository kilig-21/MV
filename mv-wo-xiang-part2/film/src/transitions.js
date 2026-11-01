// 镜头间转场：shots.json 里每镜的 transition 字段描述的是**这一镜往下一镜怎么走**，
// 所以要拿"上一镜"的字段来决定这一镜入场的叠化时长（早期版本错位了一步，已修）。
// 返回 null 表示硬切；返回 { d } 表示在进入该镜的头 d 秒内与上一镜做叠化。
//
// 分镜表里写的是"叠化 / 动作接 / 节拍切 / 拉远 / 硬切 / X → 切 Y"，
// 这里把它翻译成具体秒数，避免每处再手工配置一遍。
export function transitionFor(prevShot) {
  const t = (prevShot && prevShot.transition ? String(prevShot.transition) : '').trim();
  if (!t) return null;
  // 情绪断裂处保持硬切，不要抹平
  if (t.includes('硬切')) return null;

  if (t.includes('叠化')) return { d: 0.50, kind: 'dissolve' };
  if (t.includes('动作接')) return { d: 0.22, kind: 'match' };
  if (t.includes('节拍切')) return { d: 0.12, kind: 'beat' };
  if (t.includes('拉远')) return { d: 0.35, kind: 'pull' };

  // "小票 → 切签名纸" 这类动机剪辑：短叠化，读起来是顺势带过去
  if (t.includes('→')) return { d: 0.18, kind: 'pass' };
  return null;
}

export default transitionFor;