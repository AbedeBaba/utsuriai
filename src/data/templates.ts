// Templates system data structure - scalable and future-proof

export interface TemplatePose {
  id: string;
  nameKey: string; // Translation key
  imagePlaceholder: string; // Will be replaced with actual image later
}

export interface Template {
  id: string;
  nameKey: string; // Translation key for template name
  descriptionKey?: string; // Optional translation key for description
  categoryId: string;
  gender: 'male' | 'female' | 'unisex';
  framing: string; // e.g., "neck-to-knee"
  aspectRatio: string; // e.g., "9:16"
  poses: TemplatePose[];
  tags?: string[]; // Future: for filtering (instagram-ready, trendyol-ready, etc.)
  planRequired?: string; // Future: for pricing plan requirements
}

export interface ProductCategory {
  id: string;
  nameKey: string; // Translation key
  descriptionKey?: string; // Translation key
  icon: string; // Lucide icon name
  imagePlaceholder: string; // Will be replaced with actual image later
  order: number; // For sorting
}

// Product categories - easily extensible
export const productCategories: ProductCategory[] = [
  {
    id: 'hat',
    nameKey: 'templates.categories.hat',
    descriptionKey: 'templates.categories.hatDesc',
    icon: 'Crown',
    imagePlaceholder: '/placeholder.svg',
    order: 1,
  },
  {
    id: 'upper-wear',
    nameKey: 'templates.categories.upperWear',
    descriptionKey: 'templates.categories.upperWearDesc',
    icon: 'Shirt',
    imagePlaceholder: '/placeholder.svg',
    order: 2,
  },
  {
    id: 'belt',
    nameKey: 'templates.categories.belt',
    descriptionKey: 'templates.categories.beltDesc',
    icon: 'Minus',
    imagePlaceholder: '/placeholder.svg',
    order: 3,
  },
  {
    id: 'bottom-wear',
    nameKey: 'templates.categories.bottomWear',
    descriptionKey: 'templates.categories.bottomWearDesc',
    icon: 'RectangleVertical',
    imagePlaceholder: '/placeholder.svg',
    order: 4,
  },
  {
    id: 'shoes',
    nameKey: 'templates.categories.shoes',
    descriptionKey: 'templates.categories.shoesDesc',
    icon: 'Footprints',
    imagePlaceholder: '/placeholder.svg',
    order: 5,
  },
];

// Templates - easily extensible per category
export const templates: Template[] = [
  {
    id: 'classic-ecommerce-upper-wear',
    nameKey: 'templates.items.classicEcommerceUpperWear',
    descriptionKey: 'templates.items.classicEcommerceUpperWearDesc',
    categoryId: 'upper-wear',
    gender: 'male',
    framing: 'neck-to-knee',
    aspectRatio: '9:16',
    poses: [
      {
        id: 'front-hand-pocket-watch',
        nameKey: 'templates.poses.frontHandPocketWatch',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'side-hand-collar',
        nameKey: 'templates.poses.sideHandCollar',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'back-hands-waist',
        nameKey: 'templates.poses.backHandsWaist',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'front-wall-arms-crossed',
        nameKey: 'templates.poses.frontWallArmsCrossed',
        imagePlaceholder: '/placeholder.svg',
      },
    ],
    tags: ['e-commerce', 'classic'],
  },
  // Female version
  {
    id: 'classic-ecommerce-upper-wear-female',
    nameKey: 'templates.items.classicEcommerceUpperWearFemale',
    descriptionKey: 'templates.items.classicEcommerceUpperWearFemaleDesc',
    categoryId: 'upper-wear',
    gender: 'female',
    framing: 'neck-to-knee',
    aspectRatio: '9:16',
    poses: [
      {
        id: 'front-hand-pocket-watch-f',
        nameKey: 'templates.poses.frontHandPocketWatch',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'side-hand-collar-f',
        nameKey: 'templates.poses.sideHandCollar',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'back-hands-waist-f',
        nameKey: 'templates.poses.backHandsWaist',
        imagePlaceholder: '/placeholder.svg',
      },
      {
        id: 'front-wall-arms-crossed-f',
        nameKey: 'templates.poses.frontWallArmsCrossed',
        imagePlaceholder: '/placeholder.svg',
      },
    ],
    tags: ['e-commerce', 'classic'],
  },
];

// Helper functions
export function getTemplatesByCategory(categoryId: string): Template[] {
  return templates.filter((t) => t.categoryId === categoryId);
}

export function getTemplateById(templateId: string): Template | undefined {
  return templates.find((t) => t.id === templateId);
}

export function getCategoryById(categoryId: string): ProductCategory | undefined {
  return productCategories.find((c) => c.id === categoryId);
}

export function getSortedCategories(): ProductCategory[] {
  return [...productCategories].sort((a, b) => a.order - b.order);
}
