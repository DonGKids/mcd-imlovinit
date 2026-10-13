import { useState } from 'react';
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
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <section className="text-center space-y-3">
        <div className="inline-block bg-mcd-yellow text-mcd-brown px-5 py-2 rounded-full text-sm font-bold shadow-md">
          ✏️ 告诉我一些关于你的事
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          回答几道小问题
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
          从 160+ 麦当劳餐品中
          <br className="hidden sm:block" />
          为你挑出今天最对味的那一款
        </p>
      </section>

      <section className="mcd-card p-6 sm:p-8 space-y-8">
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
          <div className="flex items-baseline justify-between">
            <label className="text-base sm:text-lg font-semibold text-gray-800">
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
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-mcd-red focus:outline-none text-sm sm:text-base bg-white"
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
            已覆盖 41 城：4 直辖市 + 27 省会/首府 + 10 主要城市（深圳/苏州/青岛/大连/宁波/厦门/无锡/佛山/东莞/温州）
            ，也支持城市别名（如"帝都"→北京、"魔都"→上海、"羊城"→广州）
          </p>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={handleRecommend} className="mcd-button-primary text-lg">
          🚀 为我推荐
        </button>
        <button
          onClick={handleRandom}
          className="mcd-button-secondary"
          type="button"
        >
          🎲 我懒得选，随机一个
        </button>
      </div>

      <section className="text-center text-xs text-gray-500 max-w-2xl mx-auto">
        <p>
          💡 推荐算法综合 6 个维度：年龄段 / 职业 / 口味 / 心情 / 健康关注 / 时段，
          基于麦当劳官方营养数据 + 160 道餐品标签库加权打分。
        </p>
      </section>
    </div>
  );
}
