// Piercing-focused body part presets for UtsuriAI

export interface PiercingPreset {
  id: string;
  nameKey: string;
  descriptionKey: string;
  useForKey: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  imagePath: string;
}

export const piercingPresets: PiercingPreset[] = [
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

export function getPiercingPresetById(id: string): PiercingPreset | undefined {
  return piercingPresets.find(p => p.id === id);
}
