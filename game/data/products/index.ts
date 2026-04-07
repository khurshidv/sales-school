// ============================================================
// Product Definitions — Car Dealership Scenario
// Pure TS, no React
// ============================================================

export interface ProductDefinition {
  id: string;
  model: string;
  segment: { uz: string; ru: string };
  price: number;
  features: { uz: string; ru: string };
  assetPath: string;
}

const PRODUCT_DEFINITIONS: readonly ProductDefinition[] = [
  {
    id: 'cobalt',
    model: 'Chevrolet Cobalt',
    segment: { uz: 'Sedan', ru: 'Sedan' },
    price: 15_000,
    features: {
      uz: 'Tejamkor sedan, shahar uchun ideal, kam xarajat',
      ru: 'Экономичный седан, идеален для города, низкие расходы',
    },
    assetPath: '/assets/scenarios/car-dealership/cars/car_cobalt.webp',
  },
  {
    id: 'tracker',
    model: 'Chevrolet Tracker',
    segment: { uz: 'Kompakt SUV', ru: 'Компактный SUV' },
    price: 22_000,
    features: {
      uz: "Kompakt krossover, yuqori o'tirish, zamonaviy texnologiyalar",
      ru: 'Компактный кроссовер, высокая посадка, современные технологии',
    },
    assetPath: '/assets/scenarios/car-dealership/cars/car_tracker.webp',
  },
  {
    id: 'equinox',
    model: 'Chevrolet Equinox',
    segment: { uz: 'Oilaviy SUV', ru: 'Семейный SUV' },
    price: 30_000,
    features: {
      uz: "Keng salon, oila uchun qulay, xavfsizlik tizimlari to'liq",
      ru: 'Просторный салон, комфорт для семьи, полный набор систем безопасности',
    },
    assetPath: '/assets/scenarios/car-dealership/cars/car_equinox.webp',
  },
  {
    id: 'malibu',
    model: 'Chevrolet Malibu',
    segment: { uz: 'Biznes sedan', ru: 'Бизнес-седан' },
    price: 28_000,
    features: {
      uz: "Premium sedan, biznes uchrashuv va ko'ngilochar, hashamatli dizayn",
      ru: 'Премиум седан, для деловых встреч и отдыха, роскошный дизайн',
    },
    assetPath: '/assets/scenarios/car-dealership/cars/car_malibu.webp',
  },
  {
    id: 'tahoe',
    model: 'Chevrolet Tahoe',
    segment: { uz: 'Premium SUV', ru: 'Премиум SUV' },
    price: 55_000,
    features: {
      uz: "To'liq o'lchamli SUV, maksimal quvvat va hashamat, VIP segment",
      ru: 'Полноразмерный SUV, максимальная мощность и роскошь, VIP-сегмент',
    },
    assetPath: '/assets/scenarios/car-dealership/cars/car_tahoe.webp',
  },
] as const;

// --- Public API ---

export function getProduct(id: string): ProductDefinition | undefined {
  return PRODUCT_DEFINITIONS.find((p) => p.id === id);
}

export function getAllProducts(): readonly ProductDefinition[] {
  return PRODUCT_DEFINITIONS;
}

export function getProductsByPriceRange(
  min: number,
  max: number,
): ProductDefinition[] {
  return PRODUCT_DEFINITIONS.filter((p) => p.price >= min && p.price <= max);
}
