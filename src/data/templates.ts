// Templates system data structure - scalable and future-proof

export interface TemplatePose {
  id: string;
  nameKey: string; // Translation key
  imagePath: string; // Path to pose image in src/assets/templates/
  useBackView?: boolean; // If true, use back view image for this pose
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
  requiredImages: number; // How many product images user needs to upload (1 or 2)
  requiresBackView?: boolean; // If true, user must upload both front and back view
  prompt: string; // Fixed prompt for this template
}

export interface ProductCategory {
  id: string;
  nameKey: string; // Translation key
  descriptionKey?: string; // Translation key
  icon: string; // Lucide icon name
  imagePlaceholder: string; // Will be replaced with actual image later
  order: number; // For sorting
}

// Credit costs for template generation
export const TEMPLATE_CREDIT_COSTS = {
  standard: 4, // 1 credit per pose × 4 poses
  pro: 16, // 4 credits per pose × 4 poses
};

// Fixed prompt for all templates - DO NOT MODIFY
export const TEMPLATE_GENERATION_PROMPT = `Use the uploaded images as strict references. The first image is the template model image. The second image is the user-uploaded product image. Replace ONLY the clothing item worn on the model with the user-uploaded product. Preserve the original clothing's texture realism, fabric structure, color accuracy, and material details. Do NOT recolor, stylize, or reinterpret the product. The product must look exactly like the uploaded image. STRICT PRESERVATION RULES: Keep the same model, pose, body proportions, camera angle, framing, crop, background, lighting and shadows. Do NOT change pose, body shape, background, camera distance, or lighting style. The result must look like a realistic product photoshoot. Clean, photorealistic, e-commerce ready output.`;

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
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'poz1',
        nameKey: 'templates.poses.frontHandPocketWatch',
        imagePath: '/lovable-uploads/templates/male/poz1.png',
        useBackView: false,
      },
      {
        id: 'poz2',
        nameKey: 'templates.poses.sideHandCollar',
        imagePath: '/lovable-uploads/templates/male/poz2.png',
        useBackView: false,
      },
      {
        id: 'poz3',
        nameKey: 'templates.poses.backHandsWaist',
        imagePath: '/lovable-uploads/templates/male/poz3.png',
        useBackView: true,
      },
      {
        id: 'poz4',
        nameKey: 'templates.poses.frontWallArmsCrossed',
        imagePath: '/lovable-uploads/templates/male/poz4.png',
        useBackView: false,
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
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'kpoz1',
        nameKey: 'templates.poses.frontHandPocketWatch',
        imagePath: '/lovable-uploads/templates/female/kpoz1.png',
        useBackView: false,
      },
      {
        id: 'kpoz2',
        nameKey: 'templates.poses.sideHandCollar',
        imagePath: '/lovable-uploads/templates/female/kpoz2.png',
        useBackView: false,
      },
      {
        id: 'kpoz3',
        nameKey: 'templates.poses.backHandsWaist',
        imagePath: '/lovable-uploads/templates/female/kpoz3.png',
        useBackView: true,
      },
      {
        id: 'kpoz4',
        nameKey: 'templates.poses.frontWallArmsCrossed',
        imagePath: '/lovable-uploads/templates/female/kpoz4.png',
        useBackView: false,
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
