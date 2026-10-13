import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'hero', label: '首页' },
  { id: 'features', label: '特性' },
  { id: 'smart', label: '智能' },
  { id: 'audience', label: '用户' },
  { id: 'start', label: '开始' },
];

export default function IntroPages() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 监听滚动，更新 activeIndex
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      if (!container) return;
      const index = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(index);
    }
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 键盘导航：上下方向键切换 section
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const container = containerRef.current;
      if (!container) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollTo(Math.min(activeIndex + 1, SECTIONS.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollTo(Math.max(activeIndex - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollTo(SECTIONS.length - 1);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex]);

  function scrollTo(index: number) {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: index * container.clientHeight,
      behavior: 'smooth',
    });
  }

  function handleStart() {
    navigate('/survey');
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-mcd-cream"
    >
      {/* Section 1: Hero */}
      <section className="h-screen w-full snap-start flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute top-10 right-10 text-9xl opacity-20 select-none">🍔</div>
        <div className="absolute bottom-10 left-10 text-7xl opacity-15 select-none">🍟</div>
        <div className="absolute top-1/4 left-1/4 text-6xl opacity-10 select-none">🥤</div>
        <div className="relative text-center text-white space-y-6 max-w-3xl animate-fade-in">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-bold">
            🍔 麦当劳创意开发大赛参赛作品
          </div>
          <h1 className="text-5xl sm:text-7xl font-black leading-none">
            懂你餐盘
          </h1>
          <p className="text-2xl sm:text-3xl font-bold text-mcd-yellow">
            懂你的胃，更懂你的心
          </p>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto pt-2">
            基于麦当劳官方营养数据<br />
            从 160+ 道餐品中，为你精准匹配<br />
            <span className="font-bold">今天最对味的那一款</span>
          </p>
        </div>
        <ScrollHint activeIndex={activeIndex} total={SECTIONS.length} index={0} />
      </section>

      {/* Section 2: 核心特性 */}
      <section className="h-screen w-full snap-start flex items-center justify-center px-6 bg-white">
        <div className="max-w-5xl w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="text-5xl">⚡</div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
              <span className="text-mcd-red">6 维</span>加权推荐
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              综合 6 个维度，为你精准打分
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '👤', title: '年龄段', desc: '老人/儿童专属软约束' },
              { emoji: '💼', title: '职业', desc: '学生/程序员/健身/孕妈' },
              { emoji: '👅', title: '口味', desc: '甜/咸/辣/酸/淡/浓' },
              { emoji: '💭', title: '心情', desc: '治愈/提神/犒赏自己' },
              { emoji: '💪', title: '健康', desc: '低卡/高蛋白/低钠/补钙' },
              { emoji: '🕐', title: '时段', desc: '早/午/晚/加餐' },
            ].map((item) => (
              <div
                key={item.title}
                className="mcd-card p-5 text-center hover:scale-105 transition-transform"
              >
                <div className="text-4xl mb-2">{item.emoji}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <ScrollHint activeIndex={activeIndex} total={SECTIONS.length} index={1} />
      </section>

      {/* Section 3: 智能理解 */}
      <section className="h-screen w-full snap-start flex items-center justify-center px-6 bg-mcd-cream">
        <div className="max-w-5xl w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="text-5xl">🧠</div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
              <span className="text-mcd-red">懂</span>你所说
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              不只是单选心情标签 —— 你可以输入<span className="font-bold text-mcd-red">自然语言</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-gray-300">
                <p className="text-sm text-gray-500 mb-1">🗣️ 你说的</p>
                <p className="text-gray-800 italic">"今天被甲方折磨了，想吃点治愈的"</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-gray-300">
                <p className="text-sm text-gray-500 mb-1">🗣️ 你说的</p>
                <p className="text-gray-800 italic">"加班到深夜，要提神的"</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-gray-300">
                <p className="text-sm text-gray-500 mb-1">🗣️ 你说的</p>
                <p className="text-gray-800 italic">"想家了，想念小时候的味道"</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-mcd-red text-white rounded-2xl p-4 shadow-md">
                <p className="text-sm opacity-80 mb-1">💡 系统理解</p>
                <p className="font-bold">治愈 · 暖胃 · 怀旧</p>
                <p className="text-xs opacity-80 mt-1">→ 推荐：纯牛奶、热牛奶、火腿扒麦满分</p>
              </div>
              <div className="bg-mcd-red text-white rounded-2xl p-4 shadow-md">
                <p className="text-sm opacity-80 mb-1">💡 系统理解</p>
                <p className="font-bold">提神 · 咖啡 · 低卡</p>
                <p className="text-xs opacity-80 mt-1">→ 推荐：冰美式中杯、浓缩咖啡</p>
              </div>
              <div className="bg-mcd-red text-white rounded-2xl p-4 shadow-md">
                <p className="text-sm opacity-80 mb-1">💡 系统理解</p>
                <p className="font-bold">怀旧 · 暖胃 · 治愈</p>
                <p className="text-xs opacity-80 mt-1">→ 推荐：麦乐鸡、香芋派、皮蛋鸡肉粥</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>💡 内置 30+ 中文情绪关键词 · 自动解析心情 + 口味 + 健康需求</p>
          </div>
        </div>
        <ScrollHint activeIndex={activeIndex} total={SECTIONS.length} index={2} />
      </section>

      {/* Section 4: 目标用户 */}
      <section className="h-screen w-full snap-start flex items-center justify-center px-6 bg-white">
        <div className="max-w-5xl w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="text-5xl">👥</div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900">
              谁在<span className="text-mcd-red">用</span>懂你餐盘？
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              7 类用户，7 套专属推荐逻辑
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { emoji: '🎓', role: '学生', food: '麦满分 · 巨无霸' },
              { emoji: '💻', role: '程序员', food: '冰美式 · 无糖可乐' },
              { emoji: '👔', role: '白领', food: '下午茶轻食' },
              { emoji: '💪', role: '健身', food: '鲜蔬沙拉 · 冰牛奶' },
              { emoji: '🛠️', role: '体力劳动', food: '大份高能量主餐' },
              { emoji: '🤰', role: '孕妈', food: '热牛奶 · 粥 · 豆浆' },
              { emoji: '👴', role: '退休', food: '皮蛋粥 · 雪菜粥' },
              { emoji: '👶', role: '儿童', food: '新地 · 鱼排堡' },
            ].map((item) => (
              <div
                key={item.role}
                className="bg-mcd-cream rounded-2xl p-4 text-center hover:bg-mcd-yellow/30 transition-colors"
              >
                <div className="text-3xl mb-1">{item.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm">{item.role}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.food}</p>
              </div>
            ))}
          </div>
        </div>
        <ScrollHint activeIndex={activeIndex} total={SECTIONS.length} index={3} />
      </section>

      {/* Section 5: 开始使用 */}
      <section className="h-screen w-full snap-start flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-10 left-10 text-8xl opacity-20 select-none">🍔</div>
        <div className="absolute bottom-10 right-10 text-8xl opacity-20 select-none">🍟</div>
        <div className="relative text-center text-white space-y-8 max-w-2xl">
          <div className="text-6xl sm:text-7xl animate-pulse-slow">🥰</div>
          <h2 className="text-4xl sm:text-6xl font-black leading-tight">
            准备好<span className="text-mcd-yellow">开始</span>了吗？
          </h2>
          <p className="text-lg sm:text-xl text-white/90">
            回答 6 道小问题<br />
            告诉我们你今天的状态
          </p>
          <div className="pt-4">
            <button
              onClick={handleStart}
              className="bg-white text-mcd-red font-black text-xl sm:text-2xl px-10 py-5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform inline-flex items-center gap-3"
            >
              <span>开始使用</span>
              <span className="text-2xl">🚀</span>
            </button>
          </div>
          <p className="text-xs text-white/70 pt-4">
            数据来源：麦当劳官方营养信息 · 160 道餐品 · 8 维标签库
          </p>
        </div>
        {/* 最后一页不显示 ScrollHint，改为结束标识 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollTo(i)}
              aria-label={s.label}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface ScrollHintProps {
  activeIndex: number;
  total: number;
  index: number;
}

function ScrollHint({ activeIndex, total, index }: ScrollHintProps) {
  return (
    <>
      {/* 右侧/底部 滚动指示点 */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex
                ? 'bg-mcd-red w-2 h-8'
                : 'bg-gray-300 w-2'
            }`}
          />
        ))}
      </div>

      {/* 向下滚动提示（仅在不是最后页时显示） */}
      {index < total - 1 && index === activeIndex && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce z-10">
          <div className="text-xs text-center mb-1">向下滚动</div>
          <div className="text-2xl">↓</div>
        </div>
      )}
    </>
  );
}
