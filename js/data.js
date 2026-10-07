/**
 * Фоторобот: конфігурація та набори елементів обличчя
 * Файл: js/data.js
 */

const FotorobotData = (() => {
  // Палітра кольорів шкіри
  const SKIN_TONES = [
    { id: 'fair', label: 'Світлий', color: '#f3d3b8' },
    { id: 'natural', label: 'Природний', color: '#e0ac84' },
    { id: 'tan', label: 'Смаглявий', color: '#b98262' },
    { id: 'dark', label: 'Темний', color: '#7b533b' }
  ];

  // Кольори зачіски, контурів та губ
  const COLORS = {
    hair: '#3a2a22',
    stroke: '#2a1d17',
    lipsFill: '#b5524a'
  };

  // Категорії рис обличчя та доступні варіанти
  const FEATURE_CATEGORIES = {
    face: {
      id: 'face',
      name: 'Обличчя',
      icon: '👤',
      options: [
        { id: 0, label: 'Овальне' },
        { id: 1, label: 'Кругле' },
        { id: 2, label: 'Квадратне' }
      ]
    },
    hair: {
      id: 'hair',
      name: 'Зачіска',
      icon: '✂️',
      options: [
        { id: 0, label: 'Без волосся' },
        { id: 1, label: 'Коротка' },
        { id: 2, label: 'Довга' },
        { id: 3, label: 'Чубчик' }
      ]
    },
    brows: {
      id: 'brows',
      name: 'Брови',
      icon: '〰️',
      options: [
        { id: 0, label: 'Прямі' },
        { id: 1, label: 'Дугоподібні' },
        { id: 2, label: 'Похмурі' }
      ]
    },
    eyes: {
      id: 'eyes',
      name: 'Очі',
      icon: '👁️',
      options: [
        { id: 0, label: 'Мигдалеподібні' },
        { id: 1, label: 'Круглі' },
        { id: 2, label: 'Вузькі' }
      ]
    },
    nose: {
      id: 'nose',
      name: 'Ніс',
      icon: '👃',
      options: [
        { id: 0, label: 'Прямий' },
        { id: 1, label: 'Картоплиною' },
        { id: 2, label: 'Загострений' }
      ]
    },
    mouth: {
      id: 'mouth',
      name: 'Губи',
      icon: '👄',
      options: [
        { id: 0, label: 'Тонкі' },
        { id: 1, label: 'Усмішка' },
        { id: 2, label: 'Повні' }
      ]
    },
    skin: {
      id: 'skin',
      name: 'Колір шкіри',
      icon: '🎨',
      options: SKIN_TONES.map((item, index) => ({
        id: index,
        label: item.label,
        color: item.color
      }))
    }
  };

  // Повзунки мікро-коригування
  const SLIDERS = {
    nose: [
      {
        key: 'noseWidth',
        label: 'Ширина носа',
        min: 0.7,
        max: 1.5,
        step: 0.05,
        defaultValue: 1.0,
        unit: 'x'
      }
    ],
    brows: [
      {
        key: 'browThickness',
        label: 'Густота брів',
        min: 2,
        max: 8,
        step: 0.5,
        defaultValue: 4.0,
        unit: 'px'
      }
    ]
  };

  // Початковий стан портрета за замовчуванням
  const DEFAULT_STATE = {
    face: 0,
    hair: 1,
    brows: 0,
    eyes: 0,
    nose: 0,
    mouth: 0,
    skin: 1,
    noseWidth: 1.0,
    browThickness: 4.0
  };

  return {
    SKIN_TONES,
    COLORS,
    FEATURE_CATEGORIES,
    SLIDERS,
    DEFAULT_STATE
  };
})();

// Експорт у глобальну область видимості
if (typeof window !== 'undefined') {
  window.FotorobotData = FotorobotData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FotorobotData;
}
