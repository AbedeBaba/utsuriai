// Jewelry-focused body part presets for UtsuriAI

export interface JewelryPreset {
  id: string;
  nameKey: string;
  descriptionKey: string;
  useForKey: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  imagePath: string; // Preview image for the preset card
}

// Credit costs for jewelry generation (1 image per generation)
export const JEWELRY_CREDIT_COSTS = {
  standard: 1,
  pro: 4,
};

export const jewelryPresets: JewelryPreset[] = [
  {
    id: 'hand-only',
    nameKey: 'jewelry.presets.handOnly',
    descriptionKey: 'jewelry.presets.handOnlyDesc',
    useForKey: 'jewelry.presets.handOnlyUseFor',
    prompt: 'Close-up of a human hand only, cropped from mid-palm to fingertips, wearing jewelry. Realistic skin texture, natural wrinkles and pores, soft directional lighting, neutral background. Jewelry remains sharp and detailed. Slight 30 degree diagonal angle for depth. Neutral to warm skin tone. Subtle shadows to emphasize finger structure. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'arm, wrist, body, face, person, mannequin, full body, extra fingers, distorted hand, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-hand-only',
  },
  {
    id: 'hand-wrist',
    nameKey: 'jewelry.presets.handWrist',
    descriptionKey: 'jewelry.presets.handWristDesc',
    useForKey: 'jewelry.presets.handWristUseFor',
    prompt: 'Realistic human hand and wrist only, cropped from mid-forearm to fingertips, wearing jewelry. Natural relaxed hand pose, realistic skin texture, controlled highlights, minimal neutral background. Soft studio lighting, balanced highlights for metal reflection. Natural skin undertone, not glossy. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'elbow, shoulder, face, torso, mannequin, full body, extra limbs, shiny plastic skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-hand-wrist',
  },
  {
    id: 'neck-closeup',
    nameKey: 'jewelry.presets.neckCloseup',
    descriptionKey: 'jewelry.presets.neckCloseupDesc',
    useForKey: 'jewelry.presets.neckCloseupUseFor',
    prompt: 'Close-up of a human neck only, cropped from chin base to mid-neck, wearing jewelry. Clean skin texture, soft frontal lighting, neutral minimal background. Front-facing or slight side angle. Gentle shadow under jewelry. Even skin tone, no harsh contrast. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'face, lips, shoulders, chest, hair covering jewelry, full body, mannequin, AI artifacts, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-neck-closeup',
  },
  {
    id: 'neck-collarbone',
    nameKey: 'jewelry.presets.neckCollarbone',
    descriptionKey: 'jewelry.presets.neckCollarboneDesc',
    useForKey: 'jewelry.presets.neckCollarboneUseFor',
    prompt: 'Human neck and collarbone only, cropped from lower chin to upper chest, wearing jewelry. Realistic anatomy, soft diffused lighting, clean minimal background. Slight angle to show collarbone depth. Highlights on collarbone structure. Natural matte skin finish. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'face focus, breasts, shoulders wide, full torso, mannequin, plastic skin, AI look, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-neck-collarbone',
  },
  {
    id: 'single-ear',
    nameKey: 'jewelry.presets.singleEar',
    descriptionKey: 'jewelry.presets.singleEarDesc',
    useForKey: 'jewelry.presets.singleEarUseFor',
    prompt: 'Close-up of a single human ear only, side profile, hair tucked back, wearing jewelry. Realistic skin texture, soft side lighting, minimal neutral background. Side lighting to enhance metal shine. Natural skin texture around ear. Soft shadow separation. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'full face, eyes, mouth, both ears, mannequin, artificial skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-single-ear',
  },
  {
    id: 'anklet-focus',
    nameKey: 'jewelry.presets.ankletFocus',
    descriptionKey: 'jewelry.presets.ankletFocusDesc',
    useForKey: 'jewelry.presets.ankletFocusUseFor',
    prompt: 'Close-up of a human ankle and foot only, cropped from lower calf to foot, wearing jewelry. Natural skin texture, soft ambient lighting, clean minimal background. Natural relaxed foot position. Slight warm tone for lifestyle feel. Texture preserved on skin. High-end e-commerce jewelry photography, premium quality, photographed look.',
    negativePrompt: 'legs full, body, shoes, floor clutter, mannequin, plastic skin, AI artifacts, 3D render, illustration, CGI, synthetic appearance',
    aspectRatio: '1:1',
    imagePath: 'preset-anklet',
  },
];

export function getJewelryPresetById(id: string): JewelryPreset | undefined {
  return jewelryPresets.find(p => p.id === id);
}
