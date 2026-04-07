# Звуки и музыка — промпты для генерации

Все звуки для игры Chevrolet Автосалон.
Формат: **MP3, 44.1kHz**. SFX — моно. BGM — стерео.

---

## BGM — фоновая музыка (Suno / Udio)

### bgm_showroom — Фоновая музыка шоурума

**Промпт:**
```
Lofi chill instrumental, smooth jazz undertones, soft Rhodes piano, light 
percussion, vinyl crackle, warm bass, modern car showroom ambiance, 
professional relaxed mood, 90 BPM, seamless loop, no vocals, 60 seconds
```

- **Использование:** основной геймплей (фон во время диалогов и выборов)
- **Характер:** спокойный, профессиональный, не отвлекающий
- **Длительность:** 60 секунд, бесшовный цикл (loop)

---

### bgm_tension — Напряжённый момент

**Промпт:**
```
Minimal tension underscore, soft ticking percussion, low sustained synth pad, 
subtle heartbeat bass pulse, building anxiety, corporate thriller mood, 
100 BPM, seamless loop, no vocals, 30 seconds
```

- **Использование:** таймерные выборы (последние 5-10 секунд), сложные ситуации
- **Характер:** напряжённый но не пугающий, корпоративный триллер
- **Длительность:** 30 секунд, бесшовный цикл

---

### bgm_summary — Экран итогов дня

**Промпт:**
```
Calm reflective instrumental, gentle acoustic guitar, soft piano chords, 
light strings, warm and hopeful mood, end of workday feeling, 
75 BPM, seamless loop, no vocals, 45 seconds
```

- **Использование:** экран DaySummary после завершения каждого дня
- **Характер:** рефлексивный, тёплый, как конец рабочего дня
- **Длительность:** 45 секунд, бесшовный цикл

---

## SFX — звуковые эффекты

### Вариант A: ElevenLabs Sound Effects (рекомендуется)

Зайти на elevenlabs.io → Sound Effects → вставить промпт.

| ID | ElevenLabs промпт | Длительность |
|----|-------------------|-------------|
| `sfx_choice_select` | `Soft UI button click, digital interface tap, clean and modern` | 0.1-0.2с |
| `sfx_correct` | `Positive success chime, bright bell tone, game reward sound, cheerful` | 0.3-0.5с |
| `sfx_wrong` | `Soft error buzz, wrong answer tone, gentle negative feedback sound` | 0.3с |
| `sfx_timer_tick` | `Single clock tick, clean mechanical timer sound, precise` | 0.1с |
| `sfx_timer_expire` | `Short alarm buzzer, time's up signal, urgent but not harsh` | 0.5с |
| `sfx_life_lost` | `Heavy heartbeat impact then fade, dramatic life lost sound, emotional` | 0.5с |
| `sfx_life_gained` | `Rising sparkle chime, health restored sound, magical positive tone` | 0.5с |
| `sfx_achievement` | `Achievement unlock fanfare, triumphant short jingle, game reward` | 1-1.5с |
| `sfx_combo` | `Energetic power-up whoosh, combo activation sound, dynamic and punchy` | 0.3с |
| `sfx_day_complete` | `Level complete victory melody, short triumphant jingle, satisfying` | 1.5с |
| `sfx_day_fail` | `Sad game over tone, melancholic short melody, gentle defeat sound` | 1с |
| `sfx_grandmaster` | `Epic victory fanfare with orchestra, grand achievement celebration` | 3с |

### Вариант B: Стоки (Freesound / Mixkit / Pixabay Audio)

| ID | Поисковый запрос | Характеристика |
|----|-----------------|----------------|
| `sfx_choice_select` | "UI click soft" или "button tap" | Мягкий клик, 0.1-0.2с |
| `sfx_correct` | "success chime" или "correct answer" | Позитивный звон, 0.3-0.5с |
| `sfx_wrong` | "wrong buzzer soft" или "error tone" | Негативный тон, 0.3с |
| `sfx_timer_tick` | "clock tick" или "timer tick" | Одиночное тиканье, 0.1с |
| `sfx_timer_expire` | "buzzer alarm short" | Сигнал истечения, 0.5с |
| `sfx_life_lost` | "heartbeat impact" или "life lost game" | Удар сердца + спад, 0.5с |
| `sfx_life_gained` | "power up chime" или "health gained" | Восходящий звон, 0.5с |
| `sfx_achievement` | "achievement fanfare" или "unlock jingle" | Фанфары, 1-1.5с |
| `sfx_combo` | "combo hit" или "power boost" | Энергичный вжух, 0.3с |
| `sfx_day_complete` | "level complete" или "stage clear" | Победный мотив, 1.5с |
| `sfx_day_fail` | "game over sad" или "failure tone" | Грустный тон, 1с |
| `sfx_grandmaster` | "epic victory fanfare" | Эпичные фанфары, 3с |

---

## Советы по подбору

- **Лицензия:** CC0 или Creative Commons на Freesound, бесплатно на Mixkit
- **Формат:** MP3, 44.1kHz
- **SFX:** моно, нормализовать громкость (-3dB peak)
- **BGM:** стерео, обязательно **loopable** (бесшовный цикл)
- **Стиль:** современный, не ретро. Подходит к визуальной новелле в стиле Persona 5

---

## Целевая структура файлов

```
public/assets/sounds/
├── bgm/
│   ├── bgm_showroom.mp3
│   ├── bgm_tension.mp3
│   └── bgm_summary.mp3
└── sfx/
    ├── sfx_choice_select.mp3
    ├── sfx_correct.mp3
    ├── sfx_wrong.mp3
    ├── sfx_timer_tick.mp3
    ├── sfx_timer_expire.mp3
    ├── sfx_life_lost.mp3
    ├── sfx_life_gained.mp3
    ├── sfx_achievement.mp3
    ├── sfx_combo.mp3
    ├── sfx_day_complete.mp3
    ├── sfx_day_fail.mp3
    └── sfx_grandmaster.mp3
```
