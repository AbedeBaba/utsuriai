import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Language = 'en' | 'tr';

interface Translations {
  [key: string]: {
    en: string;
    tr: string;
  };
}

// Translation dictionary
export const translations: Translations = {
  // Common
  'common.dashboard': { en: 'Dashboard', tr: 'Kontrol Paneli' },
  'common.login': { en: 'Login', tr: 'Giriş Yap' },
  'common.logout': { en: 'Log Out', tr: 'Çıkış Yap' },
  'common.signup': { en: 'Sign Up', tr: 'Kayıt Ol' },
  'common.save': { en: 'Save Changes', tr: 'Değişiklikleri Kaydet' },
  'common.cancel': { en: 'Cancel', tr: 'İptal' },
  'common.delete': { en: 'Delete', tr: 'Sil' },
  'common.upgrade': { en: 'Upgrade', tr: 'Yükselt' },
  'common.back': { en: 'Back', tr: 'Geri' },
  'common.next': { en: 'Next', tr: 'İleri' },
  'common.loading': { en: 'Loading...', tr: 'Yükleniyor...' },
  'common.saving': { en: 'Saving...', tr: 'Kaydediliyor...' },
  'common.features': { en: 'Features', tr: 'Özellikler' },
  'common.pricing': { en: 'Pricing', tr: 'Fiyatlandırma' },
  'common.getStarted': { en: 'Get Started', tr: 'Başla' },
  'common.learnMore': { en: 'Learn More', tr: 'Daha Fazla' },
  
  // Auth
  'auth.welcomeBack': { en: 'Welcome back', tr: 'Tekrar hoş geldiniz' },
  'auth.signInToContinue': { en: 'Sign in to continue to your account', tr: 'Hesabınıza devam etmek için giriş yapın' },
  'auth.createAccount': { en: 'Create an account', tr: 'Hesap oluştur' },
  'auth.startCreating': { en: 'Start creating AI fashion models today', tr: 'Bugün AI moda modelleri oluşturmaya başlayın' },
  'auth.email': { en: 'Email', tr: 'E-posta' },
  'auth.password': { en: 'Password', tr: 'Şifre' },
  'auth.firstName': { en: 'First Name', tr: 'Ad' },
  'auth.lastName': { en: 'Last Name', tr: 'Soyad' },
  'auth.continueWithGoogle': { en: 'Continue with Google', tr: 'Google ile devam et' },
  'auth.orContinueWith': { en: 'Or continue with', tr: 'Veya şununla devam et' },
  'auth.noAccount': { en: "Don't have an account?", tr: 'Hesabınız yok mu?' },
  'auth.haveAccount': { en: 'Already have an account?', tr: 'Zaten hesabınız var mı?' },
  
  // Dashboard
  'dashboard.welcomeBack': { en: 'Welcome back', tr: 'Tekrar hoş geldiniz' },
  'dashboard.imageStorageInfo': { en: 'Your generated images are stored for 24 hours. Download them before they expire.', tr: 'Oluşturulan görselleriniz 24 saat saklanır. Süresi dolmadan indirin.' },
  'dashboard.newModel': { en: 'New Model', tr: 'Yeni Model' },
  'dashboard.noImages': { en: 'No images yet', tr: 'Henüz görsel yok' },
  'dashboard.startCreating': { en: 'Start creating AI-generated fashion models for your products. Your images will appear here.', tr: 'Ürünleriniz için AI destekli moda modelleri oluşturmaya başlayın. Görselleriniz burada görünecek.' },
  'dashboard.createFirst': { en: 'Create Your First Model', tr: 'İlk Modelinizi Oluşturun' },
  'dashboard.all': { en: 'All', tr: 'Tümü' },
  'dashboard.untitled': { en: 'Untitled', tr: 'İsimsiz' },
  'dashboard.selectCategory': { en: 'Select category', tr: 'Kategori seçin' },
  'dashboard.expired': { en: 'Expired', tr: 'Süresi doldu' },
  
  // Account Settings
  'account.title': { en: 'Account Settings', tr: 'Hesap Ayarları' },
  'account.subtitle': { en: 'Manage your profile information and account preferences.', tr: 'Profil bilgilerinizi ve hesap tercihlerinizi yönetin.' },
  'account.profileInfo': { en: 'Profile Information', tr: 'Profil Bilgileri' },
  'account.updateDetails': { en: 'Update your personal details here.', tr: 'Kişisel bilgilerinizi buradan güncelleyin.' },
  'account.accountDetails': { en: 'Account Details', tr: 'Hesap Detayları' },
  'account.accountInfo': { en: 'Your account information and membership details.', tr: 'Hesap bilgileriniz ve üyelik detaylarınız.' },
  'account.emailAddress': { en: 'Email Address', tr: 'E-posta Adresi' },
  'account.verified': { en: 'Verified', tr: 'Doğrulandı' },
  'account.memberSince': { en: 'Member Since', tr: 'Üyelik Tarihi' },
  'account.subscriptionPlan': { en: 'Subscription Plan', tr: 'Abonelik Planı' },
  'account.trialPlan': { en: 'Trial Plan', tr: 'Deneme Planı' },
  'account.changePassword': { en: 'Change Password', tr: 'Şifre Değiştir' },
  'account.passwordSecurity': { en: 'Update your password to keep your account secure.', tr: 'Hesabınızı güvende tutmak için şifrenizi güncelleyin.' },
  'account.newPassword': { en: 'New Password', tr: 'Yeni Şifre' },
  'account.confirmPassword': { en: 'Confirm New Password', tr: 'Yeni Şifreyi Onayla' },
  'account.passwordMinLength': { en: 'Password must be at least 6 characters long.', tr: 'Şifre en az 6 karakter olmalıdır.' },
  'account.updatePassword': { en: 'Update Password', tr: 'Şifreyi Güncelle' },
  'account.dangerZone': { en: 'Danger Zone', tr: 'Tehlikeli Bölge' },
  'account.dangerZoneDesc': { en: 'Irreversible and destructive actions.', tr: 'Geri alınamaz ve yıkıcı işlemler.' },
  'account.deleteAccount': { en: 'Delete Account', tr: 'Hesabı Sil' },
  'account.deleteAccountDesc': { en: 'Permanently delete your account and all associated data. This action cannot be undone.', tr: 'Hesabınızı ve tüm ilişkili verileri kalıcı olarak silin. Bu işlem geri alınamaz.' },
  'account.deleteConfirmTitle': { en: 'Delete Account Permanently', tr: 'Hesabı Kalıcı Olarak Sil' },
  'account.deleteConfirmDesc': { en: 'This action is permanent and irreversible. All your data will be deleted, including:', tr: 'Bu işlem kalıcı ve geri alınamaz. Aşağıdakiler dahil tüm verileriniz silinecek:' },
  'account.profileData': { en: 'Your profile information', tr: 'Profil bilgileriniz' },
  'account.generatedImages': { en: 'All generated images', tr: 'Tüm oluşturulan görseller' },
  'account.credentials': { en: 'Your account credentials', tr: 'Hesap kimlik bilgileriniz' },
  'account.subscriptionData': { en: 'Any subscription data', tr: 'Abonelik verileri' },
  'account.typeDelete': { en: 'Type DELETE to confirm:', tr: 'Onaylamak için DELETE yazın:' },
  'account.deleting': { en: 'Deleting...', tr: 'Siliniyor...' },
  'account.deleteMyAccount': { en: 'Delete My Account', tr: 'Hesabımı Sil' },
  'account.settings': { en: 'Account Settings', tr: 'Hesap Ayarları' },
  
  // Profile Dropdown
  'profile.accountSettings': { en: 'Account Settings', tr: 'Hesap Ayarları' },
  'profile.logOut': { en: 'Log Out', tr: 'Çıkış Yap' },
  
  // Filter Steps
  'filter.selectGender': { en: 'Select Gender', tr: 'Cinsiyet Seçin' },
  'filter.genderSubtitle': { en: 'Choose the gender for your fashion model', tr: 'Moda modeliniz için cinsiyet seçin' },
  'filter.male': { en: 'Male', tr: 'Erkek' },
  'filter.female': { en: 'Female', tr: 'Kadın' },
  'filter.selectEthnicity': { en: 'Select Ethnicity', tr: 'Etnik Köken Seçin' },
  'filter.ethnicitySubtitle': { en: 'Choose the ethnicity for your model', tr: 'Modeliniz için etnik köken seçin' },
  'filter.selectSkinTone': { en: 'Select Skin Tone', tr: 'Ten Rengi Seçin' },
  'filter.skinToneSubtitle': { en: 'Choose the skin tone for your model', tr: 'Modeliniz için ten rengi seçin' },
  'filter.selectHairColor': { en: 'Select Hair Color', tr: 'Saç Rengi Seçin' },
  'filter.hairColorSubtitle': { en: 'Choose the hair color for your model', tr: 'Modeliniz için saç rengi seçin' },
  'filter.selectEyeColor': { en: 'Select Eye Color', tr: 'Göz Rengi Seçin' },
  'filter.eyeColorSubtitle': { en: 'Choose the eye color for your model', tr: 'Modeliniz için göz rengi seçin' },
  'filter.selectBodyType': { en: 'Select Body Type', tr: 'Vücut Tipi Seçin' },
  'filter.bodyTypeSubtitle': { en: 'Choose the body type for your model', tr: 'Modeliniz için vücut tipi seçin' },
  'filter.selectHairType': { en: 'Select Hair Type', tr: 'Saç Tipi Seçin' },
  'filter.hairTypeSubtitle': { en: 'Choose the hair type for your model', tr: 'Modeliniz için saç tipi seçin' },
  'filter.selectHairStyle': { en: 'Select Hair Style', tr: 'Saç Stili Seçin' },
  'filter.hairStyleSubtitle': { en: 'Choose the hair style for your model', tr: 'Modeliniz için saç stili seçin' },
  'filter.selectBeardType': { en: 'Select Beard Type', tr: 'Sakal Tipi Seçin' },
  'filter.beardTypeSubtitle': { en: 'Choose the beard type for your model', tr: 'Modeliniz için sakal tipi seçin' },
  'filter.selectCoverage': { en: 'Select Coverage Option', tr: 'Örtünme Seçeneği Seçin' },
  'filter.coverageSubtitle': { en: 'Choose the coverage style for your model', tr: 'Modeliniz için örtünme stili seçin' },
  'filter.selectPose': { en: 'Select Pose', tr: 'Poz Seçin' },
  'filter.poseSubtitle': { en: 'Choose the pose for your model', tr: 'Modeliniz için poz seçin' },
  'filter.selectBackground': { en: 'Select Background', tr: 'Arka Plan Seçin' },
  'filter.backgroundSubtitle': { en: 'Choose the background for your model', tr: 'Modeliniz için arka plan seçin' },
  'filter.selectFaceType': { en: 'Select Face Type', tr: 'Yüz Tipi Seçin' },
  'filter.faceTypeSubtitle': { en: 'Choose the face type for your model', tr: 'Modeliniz için yüz tipi seçin' },
  'filter.selectExpression': { en: 'Select Expression', tr: 'İfade Seçin' },
  'filter.expressionSubtitle': { en: 'Choose the facial expression for your model', tr: 'Modeliniz için yüz ifadesi seçin' },
  
  // Result Page
  'result.yourModel': { en: 'Your Model', tr: 'Modeliniz' },
  'result.newModel': { en: 'New Model', tr: 'Yeni Model' },
  'result.regenerate': { en: 'Regenerate', tr: 'Yeniden Oluştur' },
  'result.download': { en: 'Download', tr: 'İndir' },
  'result.createAnother': { en: 'Create Another Model', tr: 'Başka Model Oluştur' },
  'result.generating': { en: 'Generating your model...', tr: 'Modeliniz oluşturuluyor...' },
  'result.pending': { en: 'Image generation pending', tr: 'Görsel oluşturma beklemede' },
  'result.modelConfig': { en: 'Model Configuration', tr: 'Model Yapılandırması' },
  
  // Clothing Page
  'clothing.title': { en: 'Upload Your Clothing', tr: 'Kıyafetinizi Yükleyin' },
  'clothing.subtitle': { en: 'Upload images of the clothing you want your model to wear', tr: 'Modelinizin giyeceği kıyafetlerin görsellerini yükleyin' },
  'clothing.generate': { en: 'Generate Model', tr: 'Model Oluştur' },
  
  // Landing Page
  'landing.hero.title': { en: 'AI Fashion Photography', tr: 'AI Moda Fotoğrafçılığı' },
  'landing.hero.subtitle': { en: 'Create stunning fashion photos with AI Generated Models', tr: 'AI Modelleri ile çarpıcı moda fotoğrafları oluşturun' },
  'landing.cta.title': { en: 'Ready to Transform Your Fashion Photography?', tr: 'Moda Fotoğrafçılığınızı Dönüştürmeye Hazır mısınız?' },
  'landing.cta.subtitle': { en: 'Join thousands of fashion brands using AI to create stunning product photos', tr: 'Çarpıcı ürün fotoğrafları oluşturmak için AI kullanan binlerce moda markasına katılın' },
  
  // Pricing
  'pricing.title': { en: 'Choose Your Plan', tr: 'Planınızı Seçin' },
  'pricing.subtitle': { en: 'Start with our trial or choose a plan that fits your needs', tr: 'Deneme ile başlayın veya ihtiyaçlarınıza uygun bir plan seçin' },
  'pricing.trial': { en: 'Trial', tr: 'Deneme' },
  'pricing.starter': { en: 'Starter', tr: 'Başlangıç' },
  'pricing.pro': { en: 'Pro', tr: 'Pro' },
  'pricing.creator': { en: 'Creator', tr: 'Yaratıcı' },
  'pricing.popular': { en: 'Popular', tr: 'Popüler' },
  'pricing.mostPowerful': { en: 'Most Powerful', tr: 'En Güçlü' },
  'pricing.perMonth': { en: '/month', tr: '/ay' },
  'pricing.generations': { en: 'generations', tr: 'oluşturma' },
  'pricing.credits': { en: 'credits', tr: 'kredi' },
  'pricing.startTrial': { en: 'Start Trial', tr: 'Denemeye Başla' },
  'pricing.getStarted': { en: 'Get Started', tr: 'Başla' },
  
  // Language
  'language.english': { en: 'English', tr: 'İngilizce' },
  'language.turkish': { en: 'Turkish', tr: 'Türkçe' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}