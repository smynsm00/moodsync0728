import type { MoodPreset, ImageAsset } from '../types/moodsync';

export const MOCK_PRESETS: MoodPreset[] = [
  {
    id: 'preset-1',
    name: 'Cinematic Vintage 70s',
    category: 'Cinematic',
    description: '따뜻한 골든 톤과 부드러운 대비로 감성적인 노스탤지어 무드 연출',
    previewColor: 'from-amber-600 to-orange-700',
    isPremium: false,
    defaultParams: {
      brightness: 105,
      contrast: 90,
      saturation: 115,
      temperature: 15,
      tint: 5,
      sepia: 20,
      hueRotate: -5,
    },
    cssFilterString: 'brightness(105%) contrast(90%) saturate(115%) sepia(20%) hue-rotate(-5deg)',
  },
  {
    id: 'preset-2',
    name: 'Kodak Portra Warm',
    category: 'Film & Analog',
    description: '아날로그 필름 특유의 자연스러운 피부 톤과 부드러운 하이라이트',
    previewColor: 'from-yellow-500 to-amber-600',
    isPremium: false,
    defaultParams: {
      brightness: 102,
      contrast: 95,
      saturation: 110,
      temperature: 12,
      tint: -2,
      sepia: 10,
      hueRotate: 0,
    },
    cssFilterString: 'brightness(102%) contrast(95%) saturate(110%) sepia(10%)',
  },
  {
    id: 'preset-3',
    name: 'Cyberpunk Neon Vibe',
    category: 'Vivid & Neon',
    description: '고대비 사이버펑크 스타일의 강렬한 마젠타/시안 네온 발색',
    previewColor: 'from-pink-600 to-cyan-500',
    isPremium: true,
    defaultParams: {
      brightness: 110,
      contrast: 135,
      saturation: 150,
      temperature: -10,
      tint: 25,
      sepia: 0,
      hueRotate: 15,
    },
    cssFilterString: 'brightness(110%) contrast(135%) saturate(150%) hue-rotate(15deg)',
  },
  {
    id: 'preset-4',
    name: 'Clean Nordic Cool',
    category: 'Commercial',
    description: '모던하고 깔끔한 상업용 제품 촬영에 적합한 차분하고 명료한 화이트 톤',
    previewColor: 'from-slate-400 to-blue-500',
    isPremium: false,
    defaultParams: {
      brightness: 108,
      contrast: 105,
      saturation: 90,
      temperature: -8,
      tint: 0,
      sepia: 0,
      hueRotate: 0,
    },
    cssFilterString: 'brightness(108%) contrast(105%) saturate(90%)',
  },
  {
    id: 'preset-5',
    name: 'Matte Monochrome Noir',
    category: 'Monochrome',
    description: '깊이 있는 흑백 콘트라스트와 매트한 질감의 정통 흑백 필름 무드',
    previewColor: 'from-neutral-700 to-neutral-900',
    isPremium: false,
    defaultParams: {
      brightness: 95,
      contrast: 130,
      saturation: 0,
      temperature: 0,
      tint: 0,
      sepia: 0,
      hueRotate: 0,
    },
    cssFilterString: 'brightness(95%) contrast(130%) grayscale(100%)',
  },
  {
    id: 'preset-6',
    name: 'Golden Hour Sunset',
    category: 'Cinematic',
    description: '해질녘 골든 아워의 황홀한 주황빛 노을을 강조하는 프리미엄 시네마 필터',
    previewColor: 'from-orange-500 to-red-600',
    isPremium: true,
    defaultParams: {
      brightness: 105,
      contrast: 110,
      saturation: 135,
      temperature: 28,
      tint: 10,
      sepia: 15,
      hueRotate: -8,
    },
    cssFilterString: 'brightness(105%) contrast(110%) saturate(135%) sepia(15%) hue-rotate(-8deg)',
  },
  {
    id: 'preset-7',
    name: 'Emerald Forest Vibe',
    category: 'Commercial',
    description: '자연 친화적 브랜드나 패션 룩북에 어울리는 싱그러운 그린 톤 앤 매너',
    previewColor: 'from-emerald-600 to-teal-700',
    isPremium: true,
    defaultParams: {
      brightness: 100,
      contrast: 110,
      saturation: 120,
      temperature: -5,
      tint: -15,
      sepia: 5,
      hueRotate: 25,
    },
    cssFilterString: 'contrast(110%) saturate(120%) hue-rotate(25deg)',
  }
];

export const INITIAL_MOCK_IMAGES: ImageAsset[] = [
  {
    id: 'img-1',
    name: 'Yosemite_Half_Dome_01.jpg',
    originalUrl: '/yosemite_half_dome.jpg',
    thumbnailUrl: '/yosemite_half_dome.jpg',
    isAnchor: true,
    width: 1920,
    height: 1080,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#D48C56', rgb: 'rgb(212, 140, 86)', hsl: 'hsl(26, 60%, 58%)', name: 'Sunset Peak Gold', textColor: '#000000', contrastRatio: '7.8:1 (AAA)' },
      { hex: '#4A5D6E', rgb: 'rgb(74, 93, 110)', hsl: 'hsl(208, 20%, 36%)', name: 'Mountain Slate', textColor: '#ffffff', contrastRatio: '6.2:1 (AA)' },
      { hex: '#9BB8D0', rgb: 'rgb(155, 184, 208)', hsl: 'hsl(207, 40%, 71%)', name: 'Alpenglow Sky', textColor: '#000000', contrastRatio: '11.5:1 (AAA)' },
      { hex: '#2A3626', rgb: 'rgb(42, 54, 38)', hsl: 'hsl(105, 17%, 18%)', name: 'Pine Forest Shadow', textColor: '#ffffff', contrastRatio: '12.4:1 (AAA)' }
    ]
  },
  {
    id: 'img-2',
    name: 'Fashion_Editorial_02.jpg',
    originalUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
    isAnchor: false,
    width: 1600,
    height: 2133,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#1B1B1B', rgb: 'rgb(27, 27, 27)', hsl: 'hsl(0, 0%, 11%)', name: 'Obsidian Black', textColor: '#ffffff', contrastRatio: '16.5:1 (AAA)' },
      { hex: '#C0392B', rgb: 'rgb(192, 57, 43)', hsl: 'hsl(6, 63%, 46%)', name: 'Crimson Accent', textColor: '#ffffff', contrastRatio: '5.4:1 (AA)' },
      { hex: '#D2B48C', rgb: 'rgb(210, 180, 140)', hsl: 'hsl(34, 44%, 69%)', name: 'Warm Tan', textColor: '#000000', contrastRatio: '7.8:1 (AAA)' },
      { hex: '#BDC3C7', rgb: 'rgb(189, 195, 199)', hsl: 'hsl(204, 8%, 76%)', name: 'Silver Mist', textColor: '#000000', contrastRatio: '9.2:1 (AAA)' },
    ]
  },
  {
    id: 'img-3',
    name: 'Minimal_Architecture_03.jpg',
    originalUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    isAnchor: false,
    width: 1600,
    height: 2400,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#34495E', rgb: 'rgb(52, 73, 94)', hsl: 'hsl(210, 29%, 29%)', name: 'Steel Blue', textColor: '#ffffff', contrastRatio: '7.5:1 (AAA)' },
      { hex: '#E74C3C', rgb: 'rgb(231, 76, 60)', hsl: 'hsl(6, 78%, 57%)', name: 'Coral Red', textColor: '#ffffff', contrastRatio: '4.6:1 (AA)' },
      { hex: '#F5F5F5', rgb: 'rgb(245, 245, 245)', hsl: 'hsl(0, 0%, 96%)', name: 'Pure Alabaster', textColor: '#000000', contrastRatio: '17.1:1 (AAA)' },
      { hex: '#95A5A6', rgb: 'rgb(149, 165, 166)', hsl: 'hsl(184, 9%, 62%)', name: 'Concrete Gray', textColor: '#000000', contrastRatio: '5.8:1 (AA)' }
    ]
  },
  {
    id: 'img-4',
    name: 'Nordic_Interior_04.jpg',
    originalUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    isAnchor: false,
    width: 1600,
    height: 2000,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#2F3640', rgb: 'rgb(47, 54, 64)', hsl: 'hsl(215, 15%, 22%)', name: 'Charcoal Dark', textColor: '#ffffff', contrastRatio: '10.2:1 (AAA)' },
      { hex: '#E1B12C', rgb: 'rgb(225, 177, 44)', hsl: 'hsl(44, 75%, 53%)', name: 'Mustard Gold', textColor: '#000000', contrastRatio: '7.4:1 (AAA)' },
      { hex: '#FBFBFB', rgb: 'rgb(251, 251, 251)', hsl: 'hsl(0, 0%, 98%)', name: 'Snow White', textColor: '#000000', contrastRatio: '18.5:1 (AAA)' },
      { hex: '#718093', rgb: 'rgb(113, 128, 147)', hsl: 'hsl(214, 13%, 51%)', name: 'Blue Stone', textColor: '#ffffff', contrastRatio: '4.6:1 (AA)' }
    ]
  },
  {
    id: 'img-5',
    name: 'Cyberpunk_Night_05.jpg',
    originalUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    isAnchor: false,
    width: 1600,
    height: 1066,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#0A0E17', rgb: 'rgb(10, 14, 23)', hsl: 'hsl(222, 39%, 6%)', name: 'Midnight Navy', textColor: '#ffffff', contrastRatio: '18.9:1 (AAA)' },
      { hex: '#FF0055', rgb: 'rgb(255, 0, 85)', hsl: 'hsl(340, 100%, 50%)', name: 'Neon Magenta', textColor: '#ffffff', contrastRatio: '4.5:1 (AA)' },
      { hex: '#00F0FF', rgb: 'rgb(0, 240, 255)', hsl: 'hsl(184, 100%, 50%)', name: 'Cyber Cyan', textColor: '#000000', contrastRatio: '12.4:1 (AAA)' },
      { hex: '#8A2BE2', rgb: 'rgb(138, 43, 226)', hsl: 'hsl(271, 76%, 53%)', name: 'Electric Violet', textColor: '#ffffff', contrastRatio: '6.1:1 (AA)' }
    ]
  },
  {
    id: 'img-6',
    name: 'Golden_Sunset_06.jpg',
    originalUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    isAnchor: false,
    width: 1600,
    height: 1067,
    appliedParams: { brightness: 100, contrast: 100, saturation: 100, temperature: 0, tint: 0, sepia: 0, hueRotate: 0 },
    colorPalette: [
      { hex: '#E67E22', rgb: 'rgb(230, 126, 34)', hsl: 'hsl(28, 80%, 52%)', name: 'Golden Amber', textColor: '#000000', contrastRatio: '6.2:1 (AA)' },
      { hex: '#2980B9', rgb: 'rgb(41, 128, 185)', hsl: 'hsl(204, 64%, 44%)', name: 'Ocean Blue', textColor: '#ffffff', contrastRatio: '5.8:1 (AA)' },
      { hex: '#FAD7A0', rgb: 'rgb(250, 215, 160)', hsl: 'hsl(37, 90%, 80%)', name: 'Soft Sand', textColor: '#000000', contrastRatio: '13.5:1 (AAA)' },
      { hex: '#8E44AD', rgb: 'rgb(142, 68, 173)', hsl: 'hsl(282, 44%, 47%)', name: 'Sunset Purple', textColor: '#ffffff', contrastRatio: '6.5:1 (AA)' }
    ]
  }
];
