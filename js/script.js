new Vue({
    el: '#app',
    data: {
      columns: [
        [], // Первый столбец 
        [], // Второй столбец 
        []  // Третий столбец 
      ],
      nextCardId: 1, // Уникальный ID для карточек
      newCardTitle: '', // Заголовок новой карточки
      newCardItems: [{ text: '' }, { text: '' }, { text: '' }], // Пункты новой карточки
      isFirstColumnLocked: false // Блокировка первого столбца
    },
    computed: {
      // Проверка валидности карточки
      isCardValid() {
        return (
          this.newCardTitle.trim() !== '' &&
          this.newCardItems.length >= 3 &&
          this.newCardItems.length <= 5 &&
          this.newCardItems.every(item => item.text.trim() !== '')
        );
      },
      // Проверка, заполнен ли первый столбец
      isFirstColumnFull() {
        return this.columns[0].length >= 3;
      },
      // Проверка, заполнен ли второй столбец
      isSecondColumnFull() {
        return this.columns[1].length >= 5;
      }
    },
    methods: {
      // Добавить пункт в новую карточку
      addItem() {
        if (this.newCardItems.length < 5) {
          this.newCardItems.push({ text: '' });
        }
      },
      // Удалить пункт из новой карточки
      removeItem(index) {
        if (this.newCardItems.length > 3) {
          this.newCardItems.splice(index, 1);
        }
      },
      // Добавить новую карточку в первый столбец
      addCard() {
        if (this.isCardValid && !this.isFirstColumnFull && !this.isFirstColumnLocked) {
          this.columns[0].push({
            id: this.nextCardId++,
            title: this.newCardTitle,
            items: this.newCardItems.map(item => ({ text: item.text, completed: false })),
            completedDate: null
          });
          // Сбросить форму
          this.newCardTitle = '';
          this.newCardItems = [{ text: '' }, { text: '' }, { text: '' }];
          this.saveData(); // Сохраняем данные
        }
      },
      // Обновить статус карточки (перемещение между столбцами)
      updateCardStatus(card) {
        const completedItems = card.items.filter(item => item.completed).length;
        const totalItems = card.items.length;
        const completionPercentage = (completedItems / totalItems) * 100;
  
        // Перемещение карточки в зависимости от процента выполнения
        if (completionPercentage > 50 && completionPercentage < 100) {
          if (!this.isSecondColumnFull) {
            this.moveCard(card, 0, 1); // Из первого столбца во второй
          } else {
            this.isFirstColumnLocked = true; // Блокируем первый столбец
          }
        } else if (completionPercentage === 100) {
          this.moveCard(card, 1, 2); // Из второго столбца в третий
          card.completedDate = new Date().toLocaleString(); // Добавляем дату завершения
          this.isFirstColumnLocked = false; // Разблокируем первый столбец
        }
        this.saveData(); // Сохраняем данные
      },
      // Перемещение карточки между столбцами
      moveCard(card, fromColumnIndex, toColumnIndex) {
        const cardIndex = this.columns[fromColumnIndex].findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          const [movedCard] = this.columns[fromColumnIndex].splice(cardIndex, 1);
          this.columns[toColumnIndex].push(movedCard);
        }
      },
      // Сохранение данных в localStorage
      saveData() {
        const data = {
          columns: this.columns,
          nextCardId: this.nextCardId,
          isFirstColumnLocked: this.isFirstColumnLocked
        };
        localStorage.setItem('notesAppData', JSON.stringify(data));
      },
      // Загрузка данных из localStorage
      loadData() {
        const data = JSON.parse(localStorage.getItem('notesAppData'));
        if (data) {
          this.columns = data.columns;
          this.nextCardId = data.nextCardId;
          this.isFirstColumnLocked = data.isFirstColumnLocked;
        }
      }
    },
    // Загружаем данные при запуске приложения
    created() {
      this.loadData();
    }
  });