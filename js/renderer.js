/**
 * Фоторобот: модуль генерації та відмальовки SVG-портрета
 * Файл: js/renderer.js
 */

const FotorobotRenderer = (() => {
  /**
   * Генерує форму контуру голови
   * @param {number} faceIndex
   * @returns {string} SVG елемент
   */
  function getHeadElement(faceIndex) {
    const heads = [
      '<ellipse cx="100" cy="120" rx="62" ry="82"/>',
      '<ellipse cx="100" cy="122" rx="72" ry="72"/>',
      '<path d="M38 70Q38 40 100 40Q162 40 162 70L158 170Q150 200 100 204Q50 200 42 170Z"/>'
    ];
    return heads[faceIndex] || heads[0];
  }

  /**
   * Генерує задній шар волосся (для довгих зачісок)
   * @param {number} hairIndex
   * @param {string} hairColor
   * @returns {string} SVG елемент
   */
  function getBackHairElement(hairIndex, hairColor) {
    if (hairIndex === 2) {
      return `<path fill="${hairColor}" d="M28 125Q22 18 100 20Q178 18 172 125L180 235L20 235Z"/>`;
    }
    return '';
  }

  /**
   * Генерує передній шар зачіски
   * @param {number} hairIndex
   * @param {string} hairColor
   * @returns {string} SVG елемент
   */
  function getFrontHairElement(hairIndex, hairColor) {
    const styles = [
      '', // Без волосся
      `<path fill="${hairColor}" d="M36 100Q30 30 100 28Q170 30 164 100Q150 62 100 60Q50 62 36 100Z"/>`,
      `<path fill="${hairColor}" d="M36 110Q30 30 100 28Q170 30 164 110Q158 70 100 62Q42 70 36 110Z"/>`,
      `<path fill="${hairColor}" d="M36 100Q30 30 100 28Q170 30 164 100L160 80Q100 94 40 80Z"/>`
    ];
    return styles[hairIndex] || '';
  }

  /**
   * Генерує ліве та праве вухо
   * @param {string} skinColor
   * @param {string} strokeColor
   * @returns {string} SVG фрагмент
   */
  function getEarsElements(skinColor, strokeColor) {
    return `
      <circle cx="38" cy="125" r="9" fill="${skinColor}" stroke="${strokeColor}" stroke-width="2"/>
      <circle cx="162" cy="125" r="9" fill="${skinColor}" stroke="${strokeColor}" stroke-width="2"/>
    `;
  }

  /**
   * Генерує пару брів
   * @param {number} browsIndex
   * @param {number} thickness
   * @param {string} hairColor
   * @returns {string} SVG елемент групи
   */
  function getEyebrowsElement(browsIndex, thickness, hairColor) {
    const browPaths = [
      ['M55 90H85', 'M115 90H145'], // Прямі
      ['M55 92Q70 80 85 90', 'M115 90Q130 80 145 92'], // Дугоподібні
      ['M55 84L85 94', 'M145 84L115 94'] // Похмурі
    ];
    const paths = browPaths[browsIndex] || browPaths[0];
    return `
      <g stroke="${hairColor}" stroke-width="${thickness}" stroke-linecap="round" fill="none">
        <path d="${paths[0]}"/>
        <path d="${paths[1]}"/>
      </g>
    `;
  }

  /**
   * Генерує одне око за координатою X
   * @param {number} x
   * @param {number} eyesIndex
   * @param {string} strokeColor
   * @returns {string} SVG фрагмент
   */
  function getSingleEye(x, eyesIndex, strokeColor) {
    switch (eyesIndex) {
      case 1: // Круглі
        return `
          <circle cx="${x}" cy="108" r="8.5" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.8"/>
          <circle cx="${x}" cy="108" r="4.5" fill="${strokeColor}"/>
        `;
      case 2: // Вузькі
        return `
          <ellipse cx="${x}" cy="108" rx="13" ry="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.8"/>
          <circle cx="${x}" cy="108" r="2.6" fill="${strokeColor}"/>
        `;
      case 0: // Мигдалеподібні
      default:
        return `
          <ellipse cx="${x}" cy="108" rx="12" ry="5.5" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.8"/>
          <circle cx="${x}" cy="108" r="4" fill="${strokeColor}"/>
        `;
    }
  }

  /**
   * Генерує ніс із масштабуванням
   * @param {number} noseIndex
   * @param {number} noseWidth
   * @param {string} strokeColor
   * @returns {string} SVG елемент
   */
  function getNoseElement(noseIndex, noseWidth, strokeColor) {
    const nosePaths = [
      'M100 112L95 142Q100 147 105 142', // Прямий
      'M100 112Q88 135 92 144Q100 150 108 144Q112 135 100 112', // Картоплиною
      'M100 110L90 146Q100 140 110 146Z' // Загострений
    ];
    const path = nosePaths[noseIndex] || nosePaths[0];
    return `
      <g transform="translate(100 0) scale(${noseWidth} 1) translate(-100 0)">
        <path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `;
  }

  /**
   * Генерує рот / губи
   * @param {number} mouthIndex
   * @param {string} strokeColor
   * @param {string} lipsFill
   * @returns {string} SVG елемент
   */
  function getMouthElement(mouthIndex, strokeColor, lipsFill) {
    const mouthPaths = [
      'M80 178Q100 180 120 178', // Тонкі
      'M78 174Q100 194 122 174', // Усмішка
      'M78 178Q100 168 122 178Q100 196 78 178Z' // Повні
    ];
    const path = mouthPaths[mouthIndex] || mouthPaths[0];
    const fill = mouthIndex === 2 ? lipsFill : 'none';

    return `
      <path d="${path}" fill="${fill}" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }

  /**
   * Створює внутрішній HTML для SVG фоторобота
   * @param {object} state
   * @returns {string}
   */
  function buildFaceSvgInner(state) {
    const data = typeof window !== 'undefined' ? window.FotorobotData : (typeof require !== 'undefined' ? require('./data.js') : null);
    const skinOptions = data?.FEATURE_CATEGORIES?.skin?.options || [];
    const colors = data?.COLORS || { hair: '#3a2a22', stroke: '#2a1d17', lipsFill: '#b5524a' };

    const skinColor = skinOptions[state.skin]?.color || '#f3d3b8';
    const { hair: hairColor, stroke: strokeColor, lipsFill } = colors;

    return `
      <rect width="200" height="240" fill="transparent"/>
      ${getBackHairElement(state.hair, hairColor)}
      ${getEarsElements(skinColor, strokeColor)}
      <g fill="${skinColor}" stroke="${strokeColor}" stroke-width="2">
        ${getHeadElement(state.face)}
      </g>
      ${getFrontHairElement(state.hair, hairColor)}
      ${getEyebrowsElement(state.brows, state.browThickness, hairColor)}
      ${getSingleEye(70, state.eyes, strokeColor)}
      ${getSingleEye(130, state.eyes, strokeColor)}
      ${getNoseElement(state.nose, state.noseWidth, strokeColor)}
      ${getMouthElement(state.mouth, strokeColor, lipsFill)}
    `;
  }

  /**
   * Створює повний окремий SVG-документ (для завантаження)
   * @param {object} state
   * @returns {string}
   */
  function buildFullSvgString(state) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="400" height="480">${buildFaceSvgInner(state)}</svg>`;
  }

  /**
   * Оновлює вміст елемента SVG на сторінці
   * @param {SVGElement} svgElement
   * @param {object} state
   */
  function renderFace(svgElement, state) {
    if (!svgElement) return;
    svgElement.innerHTML = buildFaceSvgInner(state);
  }

  return {
    buildFaceSvgInner,
    buildFullSvgString,
    renderFace
  };
})();

// Експорт
if (typeof window !== 'undefined') {
  window.FotorobotRenderer = FotorobotRenderer;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FotorobotRenderer;
}
