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
    prompt: 'Full view of a complete human hand from wrist to fingertips, all five fingers and nails clearly visible, elegant relaxed pose with slightly curved fingers, wearing jewelry. Hand positioned gracefully at a natural 20-30 degree angle. Manicured natural nails visible on every finger. Realistic skin texture with natural pores and subtle veins, soft diffused studio lighting, clean neutral background. Jewelry sharp and detailed with controlled highlights. Warm natural skin tone. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'cropped hand, partial hand, missing fingers, missing nails, clenched fist, arm, body, face, person, mannequin, full body, extra fingers, distorted hand, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, extreme close-up',
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

// Piercing presets (used by JewelryGenerate via same flow)
export const piercingJewelryPresets: JewelryPreset[] = [
  {
    id: 'belly-piercing',
    nameKey: 'piercing.presets.belly',
    descriptionKey: 'piercing.presets.bellyDesc',
    useForKey: 'piercing.presets.bellyUseFor',
    prompt: 'Close-up of a real human belly area, toned midsection cropped from lower ribcage to hip bones, wearing a belly button piercing jewelry. Realistic skin texture with natural pores and subtle muscle definition. Soft diffused studio lighting, clean neutral background. Jewelry sharp and detailed with controlled highlights. Warm natural skin tone, natural matte finish. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'full body, face, legs, arms, mannequin, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, extreme close-up, tattoo, scar, blemish, unrealistic proportions',
    aspectRatio: '1:1',
    imagePath: 'preset-belly-piercing',
  },
  {
    id: 'ear-piercing',
    nameKey: 'piercing.presets.ear',
    descriptionKey: 'piercing.presets.earDesc',
    useForKey: 'piercing.presets.earUseFor',
    prompt: 'Close-up of a single real human ear, side profile view, hair tucked back neatly, wearing ear piercing jewelry including studs and hoops along the ear. Realistic skin texture with natural pores. Soft side lighting to enhance metal shine and jewelry details. Minimal neutral background. Natural skin tone, soft shadow separation. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'full face, eyes, mouth, both ears, mannequin, artificial skin, blur, artifacts, 3D render, illustration, CGI, synthetic appearance, plastic skin, AI look',
    aspectRatio: '1:1',
    imagePath: 'preset-ear-piercing',
  },
  {
    id: 'eyebrow-piercing',
    nameKey: 'piercing.presets.eyebrow',
    descriptionKey: 'piercing.presets.eyebrowDesc',
    useForKey: 'piercing.presets.eyebrowUseFor',
    prompt: 'Close-up of a real human eyebrow area, cropped from forehead to upper cheekbone, wearing an eyebrow piercing barbell jewelry. Realistic skin texture with natural pores and fine eyebrow hairs visible. Soft frontal studio lighting, clean neutral background. Jewelry sharp and detailed with controlled highlights. Natural skin tone, matte finish. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'full face, mouth, neck, full body, mannequin, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, distorted features',
    aspectRatio: '1:1',
    imagePath: 'preset-eyebrow-piercing',
  },
  {
    id: 'lip-piercing',
    nameKey: 'piercing.presets.lip',
    descriptionKey: 'piercing.presets.lipDesc',
    useForKey: 'piercing.presets.lipUseFor',
    prompt: 'Close-up of real human lips and chin area only, cropped from nose tip to chin, wearing a lip piercing ring jewelry. Realistic skin texture with natural pores and lip texture. Soft frontal studio lighting with gentle highlights on metal. Clean neutral background. Natural lip color, matte skin finish. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'full face, eyes, forehead, neck, full body, mannequin, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, lipstick overdone',
    aspectRatio: '1:1',
    imagePath: 'preset-lip-piercing',
  },
  {
    id: 'nose-piercing',
    nameKey: 'piercing.presets.nose',
    descriptionKey: 'piercing.presets.noseDesc',
    useForKey: 'piercing.presets.noseUseFor',
    prompt: 'Close-up of a real human nose area, cropped from between the eyes to upper lip, wearing a nose piercing ring or stud jewelry. Realistic skin texture with natural pores. Soft frontal studio lighting, clean neutral background. Jewelry sharp and detailed with controlled metal highlights. Natural skin tone, matte finish. High-end e-commerce jewelry photography, premium quality, photographed editorial look.',
    negativePrompt: 'full face, mouth wide open, forehead, neck, full body, mannequin, plastic skin, over-smoothed texture, AI artifacts, 3D render, illustration, CGI, synthetic appearance, distorted nose',
    aspectRatio: '1:1',
    imagePath: 'preset-nose-piercing',
  },
];

// Combined list for lookup
const allPresets = [...jewelryPresets, ...piercingJewelryPresets];

export function getJewelryPresetById(id: string): JewelryPreset | undefined {
  return allPresets.find(p => p.id === id);
}
