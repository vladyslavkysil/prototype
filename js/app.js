/**
 * Фоторобот: Головний модуль взаємодії та логіки інтерфейсу
 * Файл: js/app.js
 */

(() => {
  'use strict';

  class FotorobotApp {
    constructor() {
      // Отримуємо глобальні залежності
      const { FEATURE_CATEGORIES, SLIDERS, DEFAULT_STATE } = window.FotorobotData;
      const { renderFace, buildFullSvgString, buildFaceSvgInner } = window.FotorobotRenderer;

      this.data = { FEATURE_CATEGORIES, SLIDERS, DEFAULT_STATE };
      this.renderer = { renderFace, buildFullSvgString, buildFaceSvgInner };

      this.state = { ...DEFAULT_STATE };
      this.activeCategory = 'face';
      this.savedSketches = [];
      this.sketchCounter = 0;

      // Кешування елементів DOM
      this.dom = {
        faceSvg: document.getElementById('face-svg'),
        descriptionText: document.getElementById('portrait-description'),
        categoriesNav: document.getElementById('categories-nav'),
        optionsGrid: document.getElementById('options-grid'),
        slidersContainer: document.getElementById('sliders-container'),
        savedList: document.getElementById('saved-list'),
        btnSave: document.getElementById('btn-save'),
        btnReset: document.getElementById('btn-reset'),
        btnRandom: document.getElementById('btn-random'),
        btnDownloadSvg: document.getElementById('btn-download-svg'),
        btnDownloadPng: document.getElementById('btn-download-png'),
        themeToggle: document.getElementById('theme-toggle'),
        toast: document.getElementById('toast')
      };

      this.init();
    }

    /**
     * Ініціалізація застосунку
     */
    init() {
      this.initTheme();
      this.loadSavedSketches();
      this.bindEvents();
      this.render();
    }

    /**
     * Налаштування теми оформлення (Світла / Темна)
     */
    initTheme() {
      const savedTheme = localStorage.getItem('fotorobot_theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButtonLabel(savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        this.updateThemeButtonLabel('dark');
      }
    }

    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('fotorobot_theme', newTheme);
      this.updateThemeButtonLabel(newTheme);
      this.showToast(`Тему змінено на: ${newTheme === 'dark' ? 'Темну' : 'Світлу'}`);
    }

    updateThemeButtonLabel(theme) {
      if (!this.dom.themeToggle) return;
      const isDark = theme === 'dark';
      this.dom.themeToggle.innerHTML = isDark ? '☀️ Світла тема' : '🌙 Темна тема';
    }

    /**
     * Завантаження збережених портретів з LocalStorage
     */
    loadSavedSketches() {
      try {
        const raw = localStorage.getItem('fotorobot_saved_sketches');
        if (raw) {
          this.savedSketches = JSON.parse(raw);
          this.sketchCounter = this.savedSketches.length;
        }
      } catch (err) {
        console.warn('Не вдалося завантажити матеріали справи:', err);
        this.savedSketches = [];
      }
    }

    /**
     * Збереження у LocalStorage
     */
    persistSavedSketches() {
      try {
        localStorage.setItem('fotorobot_saved_sketches', JSON.stringify(this.savedSketches));
      } catch (err) {
        console.warn('Помилка збереження списку:', err);
      }
    }

    /**
     * Прив'язка подій до кнопок
     */
    bindEvents() {
      this.dom.btnSave?.addEventListener('click', () => this.saveToDossier());
      this.dom.btnReset?.addEventListener('click', () => this.resetToDefault());
      this.dom.btnRandom?.addEventListener('click', () => this.randomizeFeatures());
      this.dom.btnDownloadSvg?.addEventListener('click', () => this.downloadAsSvg());
      this.dom.btnDownloadPng?.addEventListener('click', () => this.downloadAsPng());
      this.dom.themeToggle?.addEventListener('click', () => this.toggleTheme());
    }

    /**
     * Генерує словесний опис фоторобота для протоколу
     */
    generateDescription(state = this.state) {
      const getLabel = (catKey) => {
        const category = this.data.FEATURE_CATEGORIES[catKey];
        const optIndex = state[catKey];
        return category?.options[optIndex]?.label?.toLowerCase() || '';
      };

      return `Обличчя: ${getLabel('face')}. Зачіска: ${getLabel('hair')}. Брови: ${getLabel('brows')}. Очі: ${getLabel('eyes')}. Ніс: ${getLabel('nose')}. Губи: ${getLabel('mouth')}.`;
    }

    /**
     * Повне оновлення інтерфейсу
     */
    render() {
      this.renderCanvas();
      this.renderCategoryTabs();
      this.renderOptions();
      this.renderSliders();
      this.renderSavedList();
    }

    /**
     * Оновлює портрет на полотні
     */
    renderCanvas() {
      this.renderer.renderFace(this.dom.faceSvg, this.state);
      if (this.dom.descriptionText) {
        this.dom.descriptionText.textContent = this.generateDescription();
      }
    }

    /**
     * Відмальовує вкладки категорій рис
     */
    renderCategoryTabs() {
      if (!this.dom.categoriesNav) return;
      this.dom.categoriesNav.innerHTML = '';

      Object.values(this.data.FEATURE_CATEGORIES).forEach((category) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-tab';
        btn.setAttribute('aria-pressed', String(category.id === this.activeCategory));
        btn.innerHTML = `<span>${category.icon}</span> <span>${category.name}</span>`;

        btn.addEventListener('click', () => {
          this.activeCategory = category.id;
          this.renderCategoryTabs();
          this.renderOptions();
          this.renderSliders();
        });

        this.dom.categoriesNav.appendChild(btn);
      });
    }

    /**
     * Відмальовує варіанти активної категорії
     */
    renderOptions() {
      if (!this.dom.optionsGrid) return;
      this.dom.optionsGrid.innerHTML = '';

      const category = this.data.FEATURE_CATEGORIES[this.activeCategory];
      if (!category) return;

      const isSkinCategory = this.activeCategory === 'skin';

      category.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';

        if (isSkinCategory) {
          btn.className = 'swatch-btn';
          btn.style.backgroundColor = opt.color;
          btn.title = opt.label;
          btn.setAttribute('aria-label', `Відтінок шкіри: ${opt.label}`);
          btn.setAttribute('aria-pressed', String(this.state.skin === idx));
        } else {
          btn.className = 'option-btn';
          btn.textContent = opt.label;
          btn.setAttribute('aria-pressed', String(this.state[this.activeCategory] === idx));
        }

        btn.addEventListener('click', () => {
          this.state[this.activeCategory] = idx;
          this.renderCanvas();
          this.renderOptions();
        });

        this.dom.optionsGrid.appendChild(btn);
      });
    }

    /**
     * Відмальовує слайдери точного підгону
     */
    renderSliders() {
      if (!this.dom.slidersContainer) return;
      this.dom.slidersContainer.innerHTML = '';

      const activeSliders = this.data.SLIDERS[this.activeCategory] || [];

      if (activeSliders.length === 0) {
        this.dom.slidersContainer.style.display = 'none';
        return;
      }

      this.dom.slidersContainer.style.display = 'flex';

      activeSliders.forEach((config) => {
        const group = document.createElement('div');
        group.className = 'slider-group';

        const labelRow = document.createElement('div');
        labelRow.className = 'slider-label-row';

        const label = document.createElement('label');
        label.setAttribute('for', `slider-${config.key}`);
        label.textContent = config.label;

        const valueBadge = document.createElement('span');
        valueBadge.className = 'slider-value-badge';
        valueBadge.textContent = `${this.state[config.key]}${config.unit}`;

        labelRow.appendChild(label);
        labelRow.appendChild(valueBadge);

        const input = document.createElement('input');
        input.id = `slider-${config.key}`;
        input.type = 'range';
        input.min = String(config.min);
        input.max = String(config.max);
        input.step = String(config.step);
        input.value = String(this.state[config.key]);

        input.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.state[config.key] = val;
          valueBadge.textContent = `${val}${config.unit}`;
          this.renderCanvas();
        });

        group.appendChild(labelRow);
        group.appendChild(input);
        this.dom.slidersContainer.appendChild(group);
      });
    }

    /**
     * Додає поточний фоторобот у матеріали справи
     */
    saveToDossier() {
      this.sketchCounter += 1;
      const sketchItem = {
        id: Date.now(),
        number: this.sketchCounter,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        state: { ...this.state },
        description: this.generateDescription()
      };

      this.savedSketches.unshift(sketchItem);
      this.persistSavedSketches();
      this.renderSavedList();
      this.showToast(`Фоторобот #${sketchItem.number} успішно збережено у справу`);
    }

    /**
     * Скидає портрет до стандартного
     */
    resetToDefault() {
      this.state = { ...this.data.DEFAULT_STATE };
      this.activeCategory = 'face';
      this.render();
      this.showToast('Параметри скинуто до початкових');
    }

    /**
     * Генерує випадкову комбінацію рисунку обличчя
     */
    randomizeFeatures() {
      Object.keys(this.data.FEATURE_CATEGORIES).forEach((key) => {
        const opts = this.data.FEATURE_CATEGORIES[key].options;
        this.state[key] = Math.floor(Math.random() * opts.length);
      });

      this.state.noseWidth = +(0.85 + Math.random() * 0.4).toFixed(2);
      this.state.browThickness = +(2.5 + Math.random() * 4).toFixed(1);

      this.render();
      this.showToast('Згенеровано випадковий портрет підозрюваного');
    }

    /**
     * Завантажити як векторний SVG
     */
    downloadAsSvg() {
      const svgData = this.renderer.buildFullSvgString(this.state);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fotorobot-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.showToast('Файл SVG завантажено');
    }

    /**
     * Завантажити як растровий PNG
     */
    downloadAsPng() {
      const svgData = this.renderer.buildFullSvgString(this.state);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `fotorobot-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          this.showToast('Файл PNG завантажено');
        });
      };

      img.src = url;
    }

    /**
     * Відмальовує список збережених матеріалів справи
     */
    renderSavedList() {
      if (!this.dom.savedList) return;
      this.dom.savedList.innerHTML = '';

      if (this.savedSketches.length === 0) {
        this.dom.savedList.innerHTML = `
          <div class="empty-state">
            <span class="empty-state-icon">📋</span>
            Справа порожня. Складіть портрет і натисніть «Зберегти у справу».
          </div>
        `;
        return;
      }

      this.savedSketches.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'saved-item';

        const thumbSvg = `<svg viewBox="0 0 200 240">${this.renderer.buildFaceSvgInner(item.state)}</svg>`;

        li.innerHTML = `
          <div class="saved-thumb" title="Мініатюра фоторобота">${thumbSvg}</div>
          <div class="saved-info">
            <div class="saved-title-row">
              <span class="saved-number">Фоторобот #${item.number}</span>
              <span class="saved-time">${item.time}</span>
            </div>
            <p class="saved-text" title="${item.description}">${item.description}</p>
          </div>
          <div class="saved-actions">
            <button type="button" class="btn btn-sm btn-load" title="Завантажити у редактор">Відкрити</button>
            <button type="button" class="btn-remove" title="Видалити зі справи" aria-label="Видалити">✕</button>
          </div>
        `;

        li.querySelector('.btn-load')?.addEventListener('click', () => {
          this.state = { ...item.state };
          this.render();
          this.showToast(`Фоторобот #${item.number} завантажено в редактор`);
        });

        li.querySelector('.btn-remove')?.addEventListener('click', () => {
          this.savedSketches = this.savedSketches.filter((s) => s.id !== item.id);
          this.persistSavedSketches();
          this.renderSavedList();
          this.showToast(`Фоторобот #${item.number} видалено`);
        });

        this.dom.savedList.appendChild(li);
      });
    }

    /**
     * Показує спливаюче сповіщення
     */
    showToast(message) {
      if (!this.dom.toast) return;
      this.dom.toast.textContent = message;
      this.dom.toast.classList.add('show');

      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }

      this.toastTimeout = setTimeout(() => {
        this.dom.toast.classList.remove('show');
      }, 2200);
    }
  }

  // Запуск при завантаженні DOM
  document.addEventListener('DOMContentLoaded', () => {
    new FotorobotApp();
  });
})();
