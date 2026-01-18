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
  optionalSecondImage?: boolean; // If true, user can optionally upload a second image (e.g., bottom wear for shoes)
  optionalSecondImageKey?: string; // Translation key for the optional second image label
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
  // Modern Lifestyle - Male
  {
    id: 'modern-lifestyle-upper-wear-male',
    nameKey: 'templates.items.modernLifestyleUpperWearMale',
    descriptionKey: 'templates.items.modernLifestyleUpperWearMaleDesc',
    categoryId: 'upper-wear',
    gender: 'male',
    framing: 'full-body',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'es2p1',
        nameKey: 'templates.poses.lifestyleFrontRelaxed',
        imagePath: '/lovable-uploads/templates/male/es2p1.png',
        useBackView: false,
      },
      {
        id: 'es2p2',
        nameKey: 'templates.poses.lifestyleBackStanding',
        imagePath: '/lovable-uploads/templates/male/es2p2.png',
        useBackView: true,
      },
      {
        id: 'es2p3',
        nameKey: 'templates.poses.lifestyleFrontWalking',
        imagePath: '/lovable-uploads/templates/male/es2p3.png',
        useBackView: false,
      },
      {
        id: 'es2p4',
        nameKey: 'templates.poses.lifestyleSideProfile',
        imagePath: '/lovable-uploads/templates/male/es2p4.png',
        useBackView: false,
      },
    ],
    tags: ['lifestyle', 'modern', 'e-commerce'],
  },
  // Modern Lifestyle - Female
  {
    id: 'modern-lifestyle-upper-wear-female',
    nameKey: 'templates.items.modernLifestyleUpperWearFemale',
    descriptionKey: 'templates.items.modernLifestyleUpperWearFemaleDesc',
    categoryId: 'upper-wear',
    gender: 'female',
    framing: 'full-body',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 's2p1',
        nameKey: 'templates.poses.lifestyleFrontRelaxed',
        imagePath: '/lovable-uploads/templates/female/s2p1.png',
        useBackView: false,
      },
      {
        id: 's2p2',
        nameKey: 'templates.poses.lifestyleBackStanding',
        imagePath: '/lovable-uploads/templates/female/s2p2.png',
        useBackView: true,
      },
      {
        id: 's2p3',
        nameKey: 'templates.poses.lifestyleFrontWalking',
        imagePath: '/lovable-uploads/templates/female/s2p3.png',
        useBackView: false,
      },
      {
        id: 's2p4',
        nameKey: 'templates.poses.lifestyleSideProfile',
        imagePath: '/lovable-uploads/templates/female/s2p4.png',
        useBackView: false,
      },
    ],
    tags: ['lifestyle', 'modern', 'e-commerce'],
  },
  // Classic Sitting - Male
  {
    id: 'classic-sitting-upper-wear-male',
    nameKey: 'templates.items.classicSittingUpperWearMale',
    descriptionKey: 'templates.items.classicSittingUpperWearMaleDesc',
    categoryId: 'upper-wear',
    gender: 'male',
    framing: 'seated',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'es3p1',
        nameKey: 'templates.poses.seatedFrontRelaxed',
        imagePath: '/lovable-uploads/templates/male/es3p1.png',
        useBackView: false,
      },
      {
        id: 'es3p2',
        nameKey: 'templates.poses.seatedFrontCrossedLegs',
        imagePath: '/lovable-uploads/templates/male/es3p2.png',
        useBackView: false,
      },
      {
        id: 'es3p3',
        nameKey: 'templates.poses.seatedSideProfile',
        imagePath: '/lovable-uploads/templates/male/es3p3.png',
        useBackView: false,
      },
      {
        id: 'es3p4',
        nameKey: 'templates.poses.seatedBackView',
        imagePath: '/lovable-uploads/templates/male/es3p4.png',
        useBackView: true,
      },
    ],
    tags: ['lifestyle', 'classic', 'seated', 'e-commerce'],
  },
  // Classic Sitting - Female
  {
    id: 'classic-sitting-upper-wear-female',
    nameKey: 'templates.items.classicSittingUpperWearFemale',
    descriptionKey: 'templates.items.classicSittingUpperWearFemaleDesc',
    categoryId: 'upper-wear',
    gender: 'female',
    framing: 'seated',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 's3p1',
        nameKey: 'templates.poses.seatedFrontRelaxed',
        imagePath: '/lovable-uploads/templates/female/s3p1.png',
        useBackView: false,
      },
      {
        id: 's3p2',
        nameKey: 'templates.poses.seatedFrontCrossedLegs',
        imagePath: '/lovable-uploads/templates/female/s3p2.png',
        useBackView: false,
      },
      {
        id: 's3p3',
        nameKey: 'templates.poses.seatedSideProfile',
        imagePath: '/lovable-uploads/templates/female/s3p3.png',
        useBackView: false,
      },
      {
        id: 's3p4',
        nameKey: 'templates.poses.seatedBackView',
        imagePath: '/lovable-uploads/templates/female/s3p4.png',
        useBackView: true,
      },
    ],
    tags: ['lifestyle', 'classic', 'seated', 'e-commerce'],
  },
  // Classic Beanie - Female
  {
    id: 'classic-beanie-hat-female',
    nameKey: 'templates.items.classicBeanieHatFemale',
    descriptionKey: 'templates.items.classicBeanieHatFemaleDesc',
    categoryId: 'hat',
    gender: 'female',
    framing: 'head-closeup',
    aspectRatio: '1:1',
    requiredImages: 1,
    requiresBackView: false,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'hatpoz1',
        nameKey: 'templates.poses.hatFrontView',
        imagePath: '/lovable-uploads/templates/female/hatpoz1.png',
        useBackView: false,
      },
      {
        id: 'hatpozk2',
        nameKey: 'templates.poses.hatSideProfile',
        imagePath: '/lovable-uploads/templates/female/hatpozk2.png',
        useBackView: false,
      },
      {
        id: 'hatpozk3',
        nameKey: 'templates.poses.hatBackView',
        imagePath: '/lovable-uploads/templates/female/hatpozk3.png',
        useBackView: false,
      },
      {
        id: 'hatpozk4',
        nameKey: 'templates.poses.hatSeatedRelaxed',
        imagePath: '/lovable-uploads/templates/female/hatpozk4.png',
        useBackView: false,
      },
    ],
    tags: ['hat', 'beanie', 'e-commerce', 'classic'],
  },
  // Classic Beanie - Male (placeholder - images to be added later)
  {
    id: 'classic-beanie-hat-male',
    nameKey: 'templates.items.classicBeanieHatMale',
    descriptionKey: 'templates.items.classicBeanieHatMaleDesc',
    categoryId: 'hat',
    gender: 'male',
    framing: 'head-closeup',
    aspectRatio: '1:1',
    requiredImages: 1,
    requiresBackView: false,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'ehatpoz1',
        nameKey: 'templates.poses.hatFrontView',
        imagePath: '/lovable-uploads/templates/male/ehatpoz1.png',
        useBackView: false,
      },
      {
        id: 'ehatpoz2',
        nameKey: 'templates.poses.hatSideProfile',
        imagePath: '/lovable-uploads/templates/male/ehatpoz2.png',
        useBackView: false,
      },
      {
        id: 'ehatpoz3',
        nameKey: 'templates.poses.hatBackView',
        imagePath: '/lovable-uploads/templates/male/ehatpoz3.png',
        useBackView: false,
      },
      {
        id: 'ehatpoz4',
        nameKey: 'templates.poses.hatSeatedRelaxed',
        imagePath: '/lovable-uploads/templates/male/ehatpoz4.png',
        useBackView: false,
      },
    ],
    tags: ['hat', 'beanie', 'e-commerce', 'classic'],
  },
  // Classic Belt - Female
  {
    id: 'classic-belt-female',
    nameKey: 'templates.items.classicBeltFemale',
    descriptionKey: 'templates.items.classicBeltFemaleDesc',
    categoryId: 'belt',
    gender: 'female',
    framing: 'waist-closeup',
    aspectRatio: '1:1',
    requiredImages: 1,
    requiresBackView: false,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'beltp1',
        nameKey: 'templates.poses.beltFrontView',
        imagePath: '/lovable-uploads/templates/female/beltp1.png',
        useBackView: false,
      },
      {
        id: 'beltp2',
        nameKey: 'templates.poses.beltSideProfile',
        imagePath: '/lovable-uploads/templates/female/beltp2.png',
        useBackView: false,
      },
      {
        id: 'beltp3',
        nameKey: 'templates.poses.beltCloseup',
        imagePath: '/lovable-uploads/templates/female/beltp3.png',
        useBackView: false,
      },
      {
        id: 'beltp4',
        nameKey: 'templates.poses.beltBackView',
        imagePath: '/lovable-uploads/templates/female/beltp4.png',
        useBackView: false,
      },
    ],
    tags: ['belt', 'accessory', 'e-commerce', 'classic'],
  },
  // Classic Belt - Male (placeholder - images to be added later)
  {
    id: 'classic-belt-male',
    nameKey: 'templates.items.classicBeltMale',
    descriptionKey: 'templates.items.classicBeltMaleDesc',
    categoryId: 'belt',
    gender: 'male',
    framing: 'waist-closeup',
    aspectRatio: '1:1',
    requiredImages: 1,
    requiresBackView: false,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'ebeltp1',
        nameKey: 'templates.poses.beltFrontView',
        imagePath: '/lovable-uploads/templates/male/beltp1.png',
        useBackView: false,
      },
      {
        id: 'ebeltp2',
        nameKey: 'templates.poses.beltSideProfile',
        imagePath: '/lovable-uploads/templates/male/beltp2.png',
        useBackView: false,
      },
      {
        id: 'ebeltp3',
        nameKey: 'templates.poses.beltCloseup',
        imagePath: '/lovable-uploads/templates/male/beltp3.png',
        useBackView: false,
      },
      {
        id: 'ebeltp4',
        nameKey: 'templates.poses.beltBackView',
        imagePath: '/lovable-uploads/templates/male/beltp4.png',
        useBackView: false,
      },
    ],
    tags: ['belt', 'accessory', 'e-commerce', 'classic'],
  },
  // Classic Bottom Wear - Female
  {
    id: 'classic-bottom-wear-female',
    nameKey: 'templates.items.classicBottomWearFemale',
    descriptionKey: 'templates.items.classicBottomWearFemaleDesc',
    categoryId: 'bottom-wear',
    gender: 'female',
    framing: 'waist-to-ankle',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'kbottomp1',
        nameKey: 'templates.poses.bottomFrontView',
        imagePath: '/lovable-uploads/templates/female/bottomp1.png',
        useBackView: false,
      },
      {
        id: 'kbottomp2',
        nameKey: 'templates.poses.bottomSideProfile',
        imagePath: '/lovable-uploads/templates/female/bottomp2.png',
        useBackView: false,
      },
      {
        id: 'kbottomp3',
        nameKey: 'templates.poses.bottomBackView',
        imagePath: '/lovable-uploads/templates/female/bottomp3.png',
        useBackView: true,
      },
      {
        id: 'kbottomp4',
        nameKey: 'templates.poses.bottomCasualPose',
        imagePath: '/lovable-uploads/templates/female/bottomp4.png',
        useBackView: false,
      },
    ],
    tags: ['bottom-wear', 'pants', 'e-commerce', 'classic'],
  },
  // Classic Bottom Wear - Male
  {
    id: 'classic-bottom-wear-male',
    nameKey: 'templates.items.classicBottomWearMale',
    descriptionKey: 'templates.items.classicBottomWearMaleDesc',
    categoryId: 'bottom-wear',
    gender: 'male',
    framing: 'waist-to-ankle',
    aspectRatio: '9:16',
    requiredImages: 2,
    requiresBackView: true,
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'ebottomp1',
        nameKey: 'templates.poses.bottomFrontView',
        imagePath: '/lovable-uploads/templates/male/bottomp1.png',
        useBackView: false,
      },
      {
        id: 'ebottomp2',
        nameKey: 'templates.poses.bottomSideProfile',
        imagePath: '/lovable-uploads/templates/male/bottomp2.png',
        useBackView: false,
      },
      {
        id: 'ebottomp3',
        nameKey: 'templates.poses.bottomBackView',
        imagePath: '/lovable-uploads/templates/male/bottomp3.png',
        useBackView: true,
      },
      {
        id: 'ebottomp4',
        nameKey: 'templates.poses.bottomCasualPose',
        imagePath: '/lovable-uploads/templates/male/bottomp4.png',
        useBackView: false,
      },
    ],
    tags: ['bottom-wear', 'pants', 'e-commerce', 'classic'],
  },
  // Classic Shoes - Female
  {
    id: 'classic-shoes-female',
    nameKey: 'templates.items.classicShoesFemale',
    descriptionKey: 'templates.items.classicShoesFemaleDesc',
    categoryId: 'shoes',
    gender: 'female',
    framing: 'knee-to-floor',
    aspectRatio: '9:16',
    requiredImages: 1,
    requiresBackView: true,
    optionalSecondImage: true,
    optionalSecondImageKey: 'templates.optionalBottomWear',
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'kshoep1',
        nameKey: 'templates.poses.shoesFrontView',
        imagePath: '/lovable-uploads/templates/female/shoep1.png',
        useBackView: false,
      },
      {
        id: 'kshoep2',
        nameKey: 'templates.poses.shoesSideView',
        imagePath: '/lovable-uploads/templates/female/shoep2.png',
        useBackView: false,
      },
      {
        id: 'kshoep3',
        nameKey: 'templates.poses.shoesBackView',
        imagePath: '/lovable-uploads/templates/female/shoep3.png',
        useBackView: true,
      },
      {
        id: 'kshoep4',
        nameKey: 'templates.poses.shoesMirrorView',
        imagePath: '/lovable-uploads/templates/female/shoep4.jpg',
        useBackView: false,
      },
    ],
    tags: ['shoes', 'footwear', 'e-commerce', 'classic'],
  },
  // Classic Shoes - Male (placeholder - images to be added later)
  {
    id: 'classic-shoes-male',
    nameKey: 'templates.items.classicShoesMale',
    descriptionKey: 'templates.items.classicShoesMaleDesc',
    categoryId: 'shoes',
    gender: 'male',
    framing: 'knee-to-floor',
    aspectRatio: '9:16',
    requiredImages: 1,
    requiresBackView: true,
    optionalSecondImage: true,
    optionalSecondImageKey: 'templates.optionalBottomWear',
    prompt: TEMPLATE_GENERATION_PROMPT,
    poses: [
      {
        id: 'eshoep1',
        nameKey: 'templates.poses.shoesFrontView',
        imagePath: '/lovable-uploads/templates/male/shoep1.png',
        useBackView: false,
      },
      {
        id: 'eshoep2',
        nameKey: 'templates.poses.shoesSideView',
        imagePath: '/lovable-uploads/templates/male/shoep2.png',
        useBackView: false,
      },
      {
        id: 'eshoep3',
        nameKey: 'templates.poses.shoesBackView',
        imagePath: '/lovable-uploads/templates/male/shoep3.png',
        useBackView: true,
      },
      {
        id: 'eshoep4',
        nameKey: 'templates.poses.shoesMirrorView',
        imagePath: '/lovable-uploads/templates/male/shoep4.png',
        useBackView: false,
      },
    ],
    tags: ['shoes', 'footwear', 'e-commerce', 'classic'],
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
