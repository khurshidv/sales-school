# AI Generation Prompts

Промпты для генерации всех визуальных ассетов Sales School RPG.

## Стиль
**GTA V Loading Screen Art** — полуреалистичная цифровая иллюстрация, Rockstar Games aesthetic.

## Файлы

| Файл | Содержимое | Инструмент |
|------|-----------|-----------|
| [00-style-guide.md](00-style-guide.md) | Базовый стиль, цвета, правила | Справочник |
| [01-backgrounds.md](01-backgrounds.md) | 5 фонов (шоурум, офис, VIP, парковка) | Gemini Imagen |
| [02-characters-team.md](02-characters-team.md) | Команда (Рустам, Дильноза, Анвар) | Gemini Imagen |
| [03-characters-clients.md](03-characters-clients.md) | Клиенты (Бобур, Камола, Жавлон, Нилуфар, Абдуллаев, Сардор) | Gemini Imagen |
| [04-cars.md](04-cars.md) | 5 машин Chevrolet | Gemini Imagen |
| [05-cutscenes-storyboard.md](05-cutscenes-storyboard.md) | 6 катсцен с раскадровкой (start/end кадры) | Kling 3.0 + Veo3 |
| [06-ui-illustrations.md](06-ui-illustrations.md) | UI ключевые иллюстрации | Gemini Imagen |
| [13-dialogue-revision-assets.md](13-dialogue-revision-assets.md) | Дополнительные эмоции и визуалы для новой версии диалогов | Gemini Imagen |

## Порядок генерации

1. `00` — прочитать стиль-гайд
2. `02-03` — персонажи (самое важное для визуальной новеллы)
3. `01` — фоны
4. `04` — машины
5. `05` — сначала static кадры в Imagen, потом видео в Kling/Veo3
6. `06` — UI финализация
