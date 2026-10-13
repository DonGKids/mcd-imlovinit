# API 文档

Base URL: `http://localhost:4000`

## POST /api/recommend

从 160+ 道麦当劳餐品中，根据用户画像推荐 Top N。

### Request Body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ageRange` | enum | ✅ | `kid` \| `teen` \| `young` \| `middle` \| `senior` |
| `occupation` | enum | ✅ | `student` \| `programmer` \| `officeWorker` \| `fitness` \| `laborer` \| `pregnant` \| `elderly` |
| `flavorPrefs` | string[] | ❌ | 口味偏好，可多选。详见下方枚举 |
| `moods` | string[] | ❌ | 心情标签，可多选 |
| `healthFocus` | enum | ❌ | 健康关注，默认 `none` |
| `mealTime` | enum | ❌ | 时段，默认 `auto` |
| `moodText` | string | ❌ | 自由文本心情描述（最长 120 字） |
| `topN` | number | ❌ | 返回数量，默认 5，最大 10 |
| `excludeCategory` | string[] | ❌ | 排除的餐品类别 |

#### 口味 (flavorPrefs) 枚举
`sweet` `salty` `spicy` `sour` `light` `rich` `cold` `hot` `crispy` `soft` `coffee` `chocolate` `fruit` `cheese` `smoky`

#### 心情 (moods) 枚举
`happy` `tired` `stressed` `excited` `anxious` `calm` `sad` `romantic` `focus` `party` `nostalgic` `treat` `comfort` `refresh` `reward` `energize` `warmUp` `coolDown`

#### 健康关注 (healthFocus) 枚举
`none` `lowCal` `highProtein` `lowSodium` `highCalcium` `lowFat` `lowCarb` `caffeinated`

#### 时段 (mealTime) 枚举
`auto` `breakfast` `lunch` `dinner` `snack`

#### 类别 (category)
`burger` `breakfast` `drink` `side` `dessert` `salad` `coffee` `combo` `snack`

### Request Example

```bash
curl -X POST http://localhost:4000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "ageRange": "young",
    "occupation": "programmer",
    "flavorPrefs": ["coffee", "cold"],
    "moods": ["focus", "tired"],
    "healthFocus": "lowCal",
    "mealTime": "auto",
    "moodText": "今天加班到深夜",
    "topN": 5
  }'
```

### Response

```json
{
  "success": true,
  "count": 5,
  "results": [
    {
      "productName": "冰美式中杯",
      "nutrition": {
        "productName": "冰美式中杯",
        "energyKcal": 13,
        "protein": 1,
        "fat": 0,
        "carbohydrate": 2,
        "sodium": 0,
        "calcium": 7
      },
      "tags": {
        "category": "coffee",
        "mealTime": "allDay",
        "flavorTags": ["冰", "咖啡", "清淡"],
        "ageFit": ["young", "middle"],
        "occupationFit": ["programmer", "officeWorker"],
        "nutritionTags": ["caffeinated", "lowCal"],
        "moodFit": ["focus", "energize", "refresh"],
        "mainIngredient": "coffee",
        "note": "夏日提神首选"
      },
      "score": 107,
      "reasons": [
        "年龄段适配",
        "职业场景对位：程序员",
        "口味对味：冰、咖啡",
        "心情匹配：需要专注",
        "健康需求达标：含咖啡因、低卡",
        "低卡友好"
      ],
      "matchedDimensions": ["ageFit", "occupationFit", "flavor", "mood", "health"]
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "缺少必填参数：ageRange 与 occupation"
}
```

HTTP 状态码：`400` (参数缺失) / `500` (服务器错误)

---

## GET /api/catalog

返回完整的餐品目录（营养 + 标签合并后）。

### Response

```json
{
  "success": true,
  "count": 160,
  "catalog": [
    {
      "nutrition": { "productName": "...", "energyKcal": 308, ... },
      "tags": { "category": "breakfast", "flavorTags": [...], ... }
    }
  ]
}
```

---

## GET /api/meals

仅返回营养数据列表。

## GET /api/tags

仅返回标签字典。

## GET /api/health

健康检查端点。

```json
{
  "status": "ok",
  "service": "mcd-imlovinit-backend",
  "time": "2026-10-13T01:01:29.629Z"
}
```
