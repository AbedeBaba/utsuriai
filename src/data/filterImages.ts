/**
 * Centralized registry of all filter page images for prefetching.
 * Organized by filter step and gender for efficient preloading.
 */

// Gender images
import maleModel from '@/assets/gender-male.jpeg';
import femaleModel from '@/assets/gender-female.jpeg';

// Modest option images
import hijabImg from '@/assets/modest-options/hijab.png';
import standardImg from '@/assets/modest-options/standard.png';

// Female ethnicity images
import arabicImg from '@/assets/ethnicities/arabic.png';
import turkishImg from '@/assets/ethnicities/turkish.png';
import russianImg from '@/assets/ethnicities/russian.png';
import asianImg from '@/assets/ethnicities/asian.png';
import latinImg from '@/assets/ethnicities/latin.png';
import scandinavianImg from '@/assets/ethnicities/scandinavian.png';
import australianImg from '@/assets/ethnicities/australian.png';
import indianImg from '@/assets/ethnicities/indian.png';
import localAmericanImg from '@/assets/ethnicities/local-american.png';
import afroAmericanImg from '@/assets/ethnicities/afro-american.png';
import italianImg from '@/assets/ethnicities/italian.png';
import europeanImg from '@/assets/ethnicities/european.png';

// Male ethnicity images
import maleArabicImg from '@/assets/ethnicities/male-arabic.jpg';
import maleTurkishImg from '@/assets/ethnicities/male-turkish.png';
import maleRussianImg from '@/assets/ethnicities/male-russian.png';
import maleAsianImg from '@/assets/ethnicities/male-asian.png';
import maleLatinImg from '@/assets/ethnicities/male-latin.png';
import maleScandinavianImg from '@/assets/ethnicities/male-scandinavian.png';
import maleAustralianImg from '@/assets/ethnicities/male-australian.png';
import maleIndianImg from '@/assets/ethnicities/male-indian.png';
import maleLocalAmericanImg from '@/assets/ethnicities/male-local-american.png';
import maleAfroAmericanImg from '@/assets/ethnicities/male-afro-american.png';
import maleItalianImg from '@/assets/ethnicities/male-italian.png';
import maleEuropeanImg from '@/assets/ethnicities/male-european.png';

// Female hair color images
import femaleBlackHair from '@/assets/hair-colors/female-black.png';
import femaleWhiteHair from '@/assets/hair-colors/female-white.png';
import femaleBrownHair from '@/assets/hair-colors/female-brown.png';
import femaleRedHair from '@/assets/hair-colors/female-red.png';
import femaleBlondeHair from '@/assets/hair-colors/female-blonde.png';
import femaleDarkBlondeHair from '@/assets/hair-colors/female-dark-blonde.png';
import femaleBlueHair from '@/assets/hair-colors/female-blue.png';
import femalePurpleHair from '@/assets/hair-colors/female-purple.png';
import femaleGreenHair from '@/assets/hair-colors/female-green.png';
import femalePlatinumHair from '@/assets/hair-colors/female-platinum.png';

// Male hair color images
import maleBlackHair from '@/assets/hair-colors/male-black.png';
import maleWhiteHair from '@/assets/hair-colors/male-white.png';
import maleBrownHair from '@/assets/hair-colors/male-brown.png';
import maleRedHair from '@/assets/hair-colors/male-red.png';
import maleBlondeHair from '@/assets/hair-colors/male-blonde.png';
import maleDarkBlondeHair from '@/assets/hair-colors/male-dark-blonde.png';
import maleBlueHair from '@/assets/hair-colors/male-blue.png';
import malePurpleHair from '@/assets/hair-colors/male-purple.png';
import maleGreenHair from '@/assets/hair-colors/male-green.png';

// Female eye color images
import femaleBrownEye from '@/assets/eye-colors/female-brown.png';
import femaleBlueEye from '@/assets/eye-colors/female-blue.png';
import femaleHazelEye from '@/assets/eye-colors/female-hazel.png';
import femaleBlackEye from '@/assets/eye-colors/female-black.png';
import femaleGreenEye from '@/assets/eye-colors/female-green.png';
import femaleAmberEye from '@/assets/eye-colors/female-amber.png';
import femaleGreyEye from '@/assets/eye-colors/female-grey.png';

// Male eye color images
import maleBlueEye from '@/assets/eye-colors/male-blue.png';
import maleBrownEye from '@/assets/eye-colors/male-brown.png';
import maleBlackEye from '@/assets/eye-colors/male-black.png';
import maleHazelEye from '@/assets/eye-colors/male-hazel.png';
import maleGreenEye from '@/assets/eye-colors/male-green.png';
import maleAmberEye from '@/assets/eye-colors/male-amber.png';
import maleGreyEye from '@/assets/eye-colors/male-grey.png';

// Female body type images
import femaleSlim from '@/assets/body-types/female-slim.png';
import femaleAthletic from '@/assets/body-types/female-athletic.jpg';
import femaleAverage from '@/assets/body-types/female-average.png';
import femaleMuscular from '@/assets/body-types/female-muscular.png';
import femaleCurvy from '@/assets/body-types/female-curvy.png';
import femalePlusSize from '@/assets/body-types/female-plus-size.png';
import femalePetite from '@/assets/body-types/female-petite.png';
import femaleTall from '@/assets/body-types/female-tall.png';
import femaleHourglass from '@/assets/body-types/female-hourglass.png';

// Male body type images
import maleSlim from '@/assets/body-types/male-slim.png';
import maleAthletic from '@/assets/body-types/male-athletic.png';
import maleAverage from '@/assets/body-types/male-average.png';
import maleMuscular from '@/assets/body-types/male-muscular.png';
import maleCurvy from '@/assets/body-types/male-curvy.png';
import malePlusSize from '@/assets/body-types/male-plus-size.png';
import malePetite from '@/assets/body-types/male-petite.png';
import maleTall from '@/assets/body-types/male-tall.png';

// Female hair type images
import femaleStraightHairType from '@/assets/hair-types/female-straight.png';
import femaleWavyHairType from '@/assets/hair-types/female-wavy.png';
import femaleCurlyHairType from '@/assets/hair-types/female-curly.png';
import femaleCoilyHairType from '@/assets/hair-types/female-coily.png';
import femaleBaldHairType from '@/assets/hair-types/female-bald.png';
import femaleShortHairType from '@/assets/hair-types/female-short.png';
import femaleLongHairType from '@/assets/hair-types/female-long.png';

// Male hair type images
import maleStraightHairType from '@/assets/hair-types/male-straight.png';
import maleWavyHairType from '@/assets/hair-types/male-wavy.png';
import maleCurlyHairType from '@/assets/hair-types/male-curly.png';
import maleCoilyHairType from '@/assets/hair-types/male-coily.png';
import maleBaldHairType from '@/assets/hair-types/male-bald.png';
import maleShortHairType from '@/assets/hair-types/male-short.png';
import maleLongHairType from '@/assets/hair-types/male-long.png';

// Beard type images
import cleanShaven from '@/assets/beard-types/clean-shaven.png';
import stubble from '@/assets/beard-types/stubble.png';
import shortBeard from '@/assets/beard-types/short-beard.png';
import fullBeard from '@/assets/beard-types/full-beard.png';
import goatee from '@/assets/beard-types/goatee.png';
import mustache from '@/assets/beard-types/mustache.png';
import vanDyke from '@/assets/beard-types/van-dyke.png';
import circleBeard from '@/assets/beard-types/circle-beard.png';
import muttonChops from '@/assets/beard-types/mutton-chops.png';

// Female pose images
import femaleStanding from '@/assets/poses/female-standing.png';
import femaleSitting from '@/assets/poses/female-sitting.png';
import femaleLeaning from '@/assets/poses/female-leaning.png';
import femaleArmsCrossed from '@/assets/poses/female-arms-crossed.png';
import femaleBackView from '@/assets/poses/female-back-view.png';
import femaleLowAngle from '@/assets/poses/female-low-angle.png';
import femaleHandsOnHips from '@/assets/poses/female-hands-on-hips.png';
import femaleFaceCloseup from '@/assets/poses/female-face-closeup.png';

// Male pose images
import maleStanding from '@/assets/poses/male-standing.png';
import maleSitting from '@/assets/poses/male-sitting.png';
import maleLeaning from '@/assets/poses/male-leaning.png';
import maleArmsCrossed from '@/assets/poses/male-arms-crossed.png';
import maleBackView from '@/assets/poses/male-back-view.png';
import maleLowAngle from '@/assets/poses/male-low-angle.png';
import maleHandsOnHips from '@/assets/poses/male-hands-on-hips.png';
import maleFaceCloseup from '@/assets/poses/male-face-closeup.png';

// Background images
import cityBg from '@/assets/backgrounds/city.jpg';
import fashionWhiteBg from '@/assets/backgrounds/fashion-white.jpg';
import beachBg from '@/assets/backgrounds/beach.jpg';
import mountainBg from '@/assets/backgrounds/mountain.jpg';
import forestBg from '@/assets/backgrounds/forest.jpg';
import snowyBg from '@/assets/backgrounds/snowy.jpg';
import cafeBg from '@/assets/backgrounds/cafe.jpg';
import underwaterBg from '@/assets/backgrounds/underwater.png';

// Female face type images
import femaleOvalFace from '@/assets/face-types/female-oval.png';
import femaleRoundFace from '@/assets/face-types/female-round.png';
import femaleSquareFace from '@/assets/face-types/female-square.png';
import femaleHeartFace from '@/assets/face-types/female-heart.png';
import femaleOblongFace from '@/assets/face-types/female-oblong.png';
import femaleDiamondFace from '@/assets/face-types/female-diamond.png';

// Male face type images
import maleOvalFace from '@/assets/face-types/male-oval.png';
import maleRoundFace from '@/assets/face-types/male-round.png';
import maleSquareFace from '@/assets/face-types/male-square.png';
import maleHeartFace from '@/assets/face-types/male-heart.png';
import maleOblongFace from '@/assets/face-types/male-oblong.png';
import maleDiamondFace from '@/assets/face-types/male-diamond.png';

// Female expression images
import femaleNeutral from '@/assets/expressions/female-neutral.png';
import femaleSmile from '@/assets/expressions/female-smile.png';
import femaleSerious from '@/assets/expressions/female-serious.png';
import femaleConfident from '@/assets/expressions/female-confident.png';

// Male expression images
import maleNeutral from '@/assets/expressions/male-neutral.png';
import maleSmile from '@/assets/expressions/male-smile.png';
import maleSerious from '@/assets/expressions/male-serious.png';
import maleConfident from '@/assets/expressions/male-confident.png';

// Export organized image sets by filter step
export const FILTER_IMAGES = {
  gender: {
    all: [maleModel, femaleModel],
  },
  
  modestOption: {
    all: [hijabImg, standardImg],
  },
  
  ethnicity: {
    female: [
      arabicImg, turkishImg, russianImg, asianImg, latinImg, scandinavianImg,
      australianImg, indianImg, localAmericanImg, afroAmericanImg, italianImg, europeanImg
    ],
    male: [
      maleArabicImg, maleTurkishImg, maleRussianImg, maleAsianImg, maleLatinImg, maleScandinavianImg,
      maleAustralianImg, maleIndianImg, maleLocalAmericanImg, maleAfroAmericanImg, maleItalianImg, maleEuropeanImg
    ],
  },
  
  hairColor: {
    female: [
      femaleBlackHair, femaleWhiteHair, femaleBrownHair, femaleRedHair, femaleBlondeHair,
      femaleDarkBlondeHair, femaleBlueHair, femalePurpleHair, femaleGreenHair, femalePlatinumHair
    ],
    male: [
      maleBlackHair, maleWhiteHair, maleBrownHair, maleRedHair, maleBlondeHair,
      maleDarkBlondeHair, maleBlueHair, malePurpleHair, maleGreenHair
    ],
  },
  
  eyeColor: {
    female: [
      femaleBrownEye, femaleBlueEye, femaleHazelEye, femaleBlackEye,
      femaleGreenEye, femaleAmberEye, femaleGreyEye
    ],
    male: [
      maleBlueEye, maleBrownEye, maleBlackEye, maleHazelEye,
      maleGreenEye, maleAmberEye, maleGreyEye
    ],
  },
  
  bodyType: {
    female: [
      femaleSlim, femaleAthletic, femaleAverage, femaleMuscular, femaleCurvy,
      femalePlusSize, femalePetite, femaleTall, femaleHourglass
    ],
    male: [
      maleSlim, maleAthletic, maleAverage, maleMuscular, maleCurvy,
      malePlusSize, malePetite, maleTall
    ],
  },
  
  hairType: {
    female: [
      femaleStraightHairType, femaleWavyHairType, femaleCurlyHairType, femaleCoilyHairType,
      femaleBaldHairType, femaleShortHairType, femaleLongHairType
    ],
    male: [
      maleStraightHairType, maleWavyHairType, maleCurlyHairType, maleCoilyHairType,
      maleBaldHairType, maleShortHairType, maleLongHairType
    ],
  },
  
  beardType: {
    all: [
      cleanShaven, stubble, shortBeard, fullBeard, goatee,
      mustache, vanDyke, circleBeard, muttonChops
    ],
  },
  
  pose: {
    female: [
      femaleStanding, femaleSitting, femaleLeaning, femaleArmsCrossed,
      femaleBackView, femaleLowAngle, femaleHandsOnHips, femaleFaceCloseup
    ],
    male: [
      maleStanding, maleSitting, maleLeaning, maleArmsCrossed,
      maleBackView, maleLowAngle, maleHandsOnHips, maleFaceCloseup
    ],
  },
  
  background: {
    all: [
      cityBg, fashionWhiteBg, beachBg, mountainBg,
      forestBg, snowyBg, cafeBg, underwaterBg
    ],
  },
  
  faceType: {
    female: [
      femaleOvalFace, femaleRoundFace, femaleSquareFace,
      femaleHeartFace, femaleOblongFace, femaleDiamondFace
    ],
    male: [
      maleOvalFace, maleRoundFace, maleSquareFace,
      maleHeartFace, maleOblongFace, maleDiamondFace
    ],
  },
  
  expression: {
    female: [femaleNeutral, femaleSmile, femaleSerious, femaleConfident],
    male: [maleNeutral, maleSmile, maleSerious, maleConfident],
  },
};

/**
 * Get images for a specific filter step based on gender
 */
export function getFilterImages(
  step: keyof typeof FILTER_IMAGES,
  gender: 'Male' | 'Female' | '' = ''
): string[] {
  const stepImages = FILTER_IMAGES[step];
  
  if ('all' in stepImages) {
    return stepImages.all;
  }
  
  if (gender === 'Male' && 'male' in stepImages) {
    return stepImages.male;
  }
  
  if (gender === 'Female' && 'female' in stepImages) {
    return stepImages.female;
  }
  
  // Fallback to female if no gender specified
  if ('female' in stepImages) {
    return stepImages.female;
  }
  
  return [];
}

/**
 * Get the next filter step's images based on current step and config
 */
export function getNextStepImages(
  currentStep: string,
  gender: 'Male' | 'Female' | '' = '',
  modestOption: string = ''
): string[] {
  const stepOrder: (keyof typeof FILTER_IMAGES)[] = [
    'gender',
    'modestOption',
    'ethnicity',
    'hairColor',
    'eyeColor',
    'bodyType',
    'hairType',
    'beardType',
    'pose',
    'background',
    'faceType',
    'expression',
  ];
  
  const currentIndex = stepOrder.indexOf(currentStep as keyof typeof FILTER_IMAGES);
  if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
    return [];
  }
  
  let nextStep = stepOrder[currentIndex + 1];
  
  // Skip modest option for males
  if (nextStep === 'modestOption' && gender === 'Male') {
    nextStep = stepOrder[currentIndex + 2];
  }
  
  // Skip hair color and hair type for Hijab users
  if ((nextStep === 'hairColor' || nextStep === 'hairType') && modestOption === 'Hijab') {
    const skipIndex = stepOrder.indexOf(nextStep);
    nextStep = stepOrder[skipIndex + 1];
  }
  
  // Skip beard type for females
  if (nextStep === 'beardType' && gender === 'Female') {
    const skipIndex = stepOrder.indexOf(nextStep);
    nextStep = stepOrder[skipIndex + 1];
  }
  
  return getFilterImages(nextStep, gender as 'Male' | 'Female' | '');
}
