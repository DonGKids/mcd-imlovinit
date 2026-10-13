import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OptionPills, TextMoodInput } from '@/components/OptionPills';
import {
  AGE_OPTIONS,
  OCCUPATION_OPTIONS,
  FLAVOR_OPTIONS,
  MOOD_OPTIONS,
  HEALTH_OPTIONS,
  MEAL_TIME_OPTIONS,
} from '@/utils/options';
import type {
  AgeRange,
  Occupation,
  FlavorPref,
  Mood,
  HealthFocus,
  MealTime,
} from '@/types';

export default function SurveyForm() {
  const navigate = useNavigate();

  const [ageRange, setAgeRange] = useState<AgeRange>('young');
  const [occupation, setOccupation] = useState<Occupation>('student');
  const [flavorPrefs, setFlavorPrefs] = useState<FlavorPref[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [healthFocus, setHealthFocus] = useState<HealthFocus>('none');
  const [mealTime, setMealTime] = useState<MealTime>('auto');
  const [moodText, setMoodText] = useState('');

  // 附近门店定位
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationMsg, setLocationMsg] = useState<string | null>(null);

  function handleUseMyLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMsg('当前浏览器不支持定位，请手动输入地址');
      return;
    }
    setLocating(true);
    setLocationMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        setLocationMsg(`✅ 已获取定位（精度 ${Math.round(pos.coords.accuracy)}m）`);
      },
      (err) => {
        setLocating(false);
        setLocationMsg(`定位失败：${err.message || '用户拒绝或无信号'}，可手动输入地址`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function handleRecommend() {
    navigate('/result', {
      state: {
        ageRange,
        occupation,
        flavorPrefs,
        moods,
        healthFocus,
        mealTime,
        moodText,
        address: address.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      },
    });
  }

  function handleRandom() {
    const age = AGE_OPTIONS[Math.floor(Math.random() * AGE_OPTIONS.length)].value as AgeRange;
    const occ = OCCUPATION_OPTIONS[Math.floor(Math.random() * OCCUPATION_OPTIONS.length)]
      .value as Occupation;

    setAgeRange(age);
    setOccupation(occ);
    setFlavorPrefs([
      FLAVOR_OPTIONS[Math.floor(Math.random() * FLAVOR_OPTIONS.length)].value as FlavorPref,
    ]);
    setMoods([MOOD_OPTIONS[Math.floor(Math.random() * MOOD_OPTIONS.length)].value as Mood]);
    setHealthFocus(HEALTH_OPTIONS[Math.floor(Math.random() * HEALTH_OPTIONS.length)].value as HealthFocus);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* 顶部标题 */}
      <section className="text-center space-y-2 mb-6">
        <div className="inline-block bg-mcd-yellow text-mcd-brown px-5 py-2 rounded-full text-sm font-bold shadow-md">
          ✏️ 告诉我一些关于你的事
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          回答几道小问题
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          从 160+ 麦当劳餐品中，为你挑出今天最对味的那一款
        </p>
      </section>

      {/* 左侧表单 + 右侧侧栏 */}
      <div className="grid lg:grid-cols-5 gap-5 lg:gap-6">
        {/* 左侧：表单 */}
        <div className="lg:col-span-3 space-y-5">
          <div className="mcd-card p-5 sm:p-6 space-y-6">
            <OptionPills<AgeRange>
              label="1. 你的年龄段"
              options={AGE_OPTIONS}
              selected={ageRange}
              onChange={(v) => setAgeRange(v as AgeRange)}
            />
            <OptionPills<Occupation>
              label="2. 你的职业 / 身份"
              options={OCCUPATION_OPTIONS}
              selected={occupation}
              onChange={(v) => setOccupation(v as Occupation)}
            />
            <OptionPills<FlavorPref>
              label="3. 今天想吃什么口味？(可多选)"
              options={FLAVOR_OPTIONS}
              selected={flavorPrefs}
              onChange={(v) => setFlavorPrefs(v as FlavorPref[])}
              multi
            />
            <OptionPills<Mood>
              label="4. 现在的心情？(可多选)"
              options={MOOD_OPTIONS}
              selected={moods}
              onChange={(v) => setMoods(v as Mood[])}
              multi
            />
            <OptionPills<HealthFocus>
              label="5. 健康关注（可选）"
              options={HEALTH_OPTIONS}
              selected={healthFocus}
              onChange={(v) => setHealthFocus(v as HealthFocus)}
            />
            <OptionPills<MealTime>
              label="6. 用餐时段"
              options={MEAL_TIME_OPTIONS}
              selected={mealTime}
              onChange={(v) => setMealTime(v as MealTime)}
            />
            <TextMoodInput
              value={moodText}
              onChange={setMoodText}
              placeholder="比如：今天加班到深夜，想吃点治愈的、又不想太胖..."
            />

            {/* 附近门店定位（可选） */}
            <div className="space-y-3 pt-2 border-t border-dashed border-gray-200">
              <div className="flex items-baseline justify-between flex-wrap gap-1">
                <label className="text-sm sm:text-base font-semibold text-gray-800">
                  7. 你在哪？（可选）
                </label>
                <span className="text-xs text-gray-500">推荐附近 3 家麦当劳</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例如：北京市朝阳区三里屯 / 上海市南京东路"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-mcd-red focus:outline-none text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  className="mcd-button-secondary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locating ? '📡 定位中…' : '📍 使用我的位置'}
                </button>
              </div>

              {locationMsg && (
                <p
                  className={`text-xs ${locationMsg.startsWith('✅') ? 'text-green-600' : 'text-amber-600'}`}
                >
                  {locationMsg}
                </p>
              )}

              {coords && (
                <p className="text-xs text-gray-500">
                  已记录坐标：{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              )}

              <p className="text-xs text-gray-400">
                已覆盖 41 城：4 直辖市 + 27 省会 + 10 主要城市，也支持"帝都/魔都/羊城"等别名
              </p>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleRecommend} className="mcd-button-primary text-lg flex-1">
              🚀 为我推荐
            </button>
            <button
              onClick={handleRandom}
              className="mcd-button-secondary flex-1"
              type="button"
            >
              🎲 懒得选，随机一个
            </button>
          </div>

          <p className="text-center text-xs text-gray-500">
            💡 6 维加权算法：年龄段 / 职业 / 口味 / 心情 / 健康 / 时段 · 基于麦当劳官方营养数据
          </p>
        </div>

        {/* 右侧：侧栏（联名活动 + 今日语录） */}
        <aside className="lg:col-span-2 space-y-4 lg:sticky lg:top-4 lg:self-start">
          <RecentCollabsCard />
          <DailyQuoteCard />
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
 * 右侧侧栏：近期联名活动
 * ========================================================== */
function RecentCollabsCard() {
  const events = useMemo(
    () => [
      { emoji: '🚀', brand: '麦当劳 × 三体', desc: '宇宙级联名套餐', tag: '10月限定' },
      { emoji: '🧸', brand: '麦当劳 × Line Friends', desc: '布朗熊开心乐园餐', tag: '进行中' },
      { emoji: '🍌', brand: '麦当劳 × 小黄人', desc: '夏日酷爽香蕉冰淇淋', tag: '回顾' },
      { emoji: '🐑', brand: '麦当劳 × 喜羊羊', desc: '童年回忆主题套餐', tag: '回顾' },
    ],
    [],
  );

  return (
    <div className="mcd-card p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-lg">🎉</span>近期联名活动
      </h3>
      <ul className="space-y-3">
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-mcd-yellow/30 flex items-center justify-center text-xl">
              {e.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {e.brand}
                </p>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                    e.tag === '进行中' || e.tag.includes('限定')
                      ? 'bg-mcd-red text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {e.tag}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{e.desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        * 联名活动以麦当劳官方公告为准
      </p>
    </div>
  );
}

/* ============================================================
 * 右侧侧栏：今日语录（每次进页面随机 + 可手动刷新）
 * ========================================================== */
function DailyQuoteCard() {
  const quotes = useMemo(
    () => [
      { text: '心情不好的时候，来份巨无霸，世界都亮了。', author: '懂你餐盘' },
      { text: '薯条的香味，是童年最简单的快乐。', author: '懂你餐盘' },
      { text: '没有一杯咖啡解决不了的事；如果有，那就两杯。', author: '懂你餐盘' },
      { text: '热牛奶的温度，刚好够治愈今天。', author: '懂你餐盘' },
      { text: '芝士就是力量，巨无霸就是信仰。', author: '懂你餐盘' },
      { text: '每一口都是对生活的小小犒赏。', author: '懂你餐盘' },
      { text: '今天也要好好吃饭，这是最低成本的快乐。', author: '懂你餐盘' },
      { text: '咖啡因 + 阳光 = 一整天的好心情。', author: '懂你餐盘' },
      { text: '减脂不可怕，可怕的是减掉了笑容。', author: '懂你餐盘' },
      { text: '加班到深夜，记得奖励自己一份宵夜。', author: '懂你餐盘' },
    ],
    [],
  );

  // 每次组件挂载时随机挑一条
  const [index, setIndex] = useState(() => Math.floor(Math.random() * quotes.length));

  // 刷新：换一条，且避免和当前重复
  const handleRefresh = () => {
    if (quotes.length <= 1) return;
    let next = Math.floor(Math.random() * quotes.length);
    while (next === index) {
      next = Math.floor(Math.random() * quotes.length);
    }
    setIndex(next);
  };

  const quote = quotes[index];

  return (
    <div className="mcd-card p-4 sm:p-5 bg-gradient-to-br from-mcd-yellow/30 via-white to-mcd-red/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">💭</span>今日语录
        </h3>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="换一条语录"
          title="换一条"
          className="text-gray-400 hover:text-mcd-red transition-all p-1.5 rounded-full hover:bg-white/60 active:scale-90"
        >
          {/* 旋转刷新图标 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
      <blockquote className="text-base sm:text-lg text-gray-800 leading-relaxed font-medium transition-opacity duration-300" key={index}>
        "{quote.text}"
      </blockquote>
      <p className="text-xs text-gray-500 mt-3 text-right">— {quote.author}</p>
    </div>
  );
}
