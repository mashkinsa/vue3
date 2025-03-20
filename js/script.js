Vue.component('add-card-form', {
  template: `
    <div class="add-card-form">
      <h2>Добавить новую карточку</h2>
      <input v-model="newCardTitle" placeholder="Заголовок карточки" class="input-field">
      <textarea v-model="newCardDescription" placeholder="Описание задачи" class="input-field"></textarea>
      <input type="date" v-model="newCardDeadline" class="input-field">
      <button @click="addCard" :disabled="!isCardValid">Добавить карточку</button>
      <p v-if="!isCardValid" class="error-message">Заполните все поля.</p>
    </div>
  `,
  data() {
    return {
      newCardTitle: '',
      newCardDescription: '',
      newCardDeadline: '',
    };
  },
  computed: {
    isCardValid() {
      return (
        this.newCardTitle.trim() !== '' &&
        this.newCardDescription.trim() !== '' &&
        this.newCardDeadline.trim() !== ''
      );
    },
  },
  methods: {
    addCard() {
      const newCard = {
        id: Date.now(),
        title: this.newCardTitle,
        description: this.newCardDescription,
        deadline: this.newCardDeadline,
        createdAt: new Date().toLocaleString(),
        lastEdited: new Date().toLocaleString(),
        status: 'planned',
        isOverdue: false, // Новое поле для хранения статуса просрочки
        returnReason: '', // Новое поле для хранения причины возврата
      };
      this.$emit('add-card', newCard);
      this.resetForm();
    },
    resetForm() {
      this.newCardTitle = '';
      this.newCardDescription = '';
      this.newCardDeadline = '';
    },
  },
});

Vue.component('card', {
  props: {
    card: Object,
    showMoveButton: Boolean, // Пропс для отображения кнопки "Переместить"
  },
  template: `
  <div class="card" :class="{ overdue: card.isOverdue, completed: !card.isOverdue && card.status === 'completed' }">
    <h3>{{ card.title }}</h3>
    <p>{{ card.description }}</p>
    <p><strong>Дэдлайн:</strong> {{ card.deadline }}</p>
    <p><strong>Создано:</strong> {{ card.createdAt }}</p>
    <p><strong>Последнее редактирование:</strong> {{ card.lastEdited }}</p>
    <p v-if="card.status === 'completed'">
      <strong>Статус:</strong>
      <span v-if="card.isOverdue" class="status overdue">Просрочено</span>
      <span v-else class="status completed">Выполнено в срок</span>
    </p>
    <p v-if="card.status === 'inProgress' && card.returnReason">
      <strong>Причина возврата:</strong> {{ card.returnReason }}
    </p>
    <button @click="editCard">Редактировать</button>
    <button @click="deleteCard">Удалить</button>
    <button v-if="showMoveButton" @click="moveCard">Переместить</button>
    <button v-if="card.status === 'testing'" @click="returnCard">Вернуть</button>
  </div>
`,
  methods: {
    editCard() {
      this.$emit('edit-card', this.card);
    },
    deleteCard() {
      this.$emit('delete-card', this.card);
    },
    moveCard() {
      this.$emit('move-card', this.card);
    },
    returnCard() {
      this.$emit('return-card', this.card);
    },
  },
});

Vue.component('column', {
  props: {
    title: String,
    cards: Array,
    showMoveButton: Boolean, // Пропс для отображения кнопки "Переместить"
  },
  template: `
    <div class="column">
      <h2>{{ title }}</h2>
      <transition-group name="card-move" tag="div">
        <card
          v-for="card in cards"
          :key="card.id"
          :card="card"
          :show-move-button="showMoveButton"
          @edit-card="handleEditCard"
          @delete-card="handleDeleteCard"
          @move-card="handleMoveCard"
          @return-card="handleReturnCard"
        ></card>
      </transition-group>
    </div>
  `,
  methods: {
    handleEditCard(card) {
      this.$emit('edit-card', card);
    },
    handleDeleteCard(card) {
      this.$emit('delete-card', card);
    },
    handleMoveCard(card) {
      this.$emit('move-card', card);
    },
    handleReturnCard(card) {
      this.$emit('return-card', card);
    },
  },
});

Vue.component('edit-card-form', {
  props: {
    card: Object,
  },
  template: `
    <div>
      <h2>Редактировать карточку</h2>
      <input v-model="editedCard.title" placeholder="Заголовок" class="input-field">
      <textarea v-model="editedCard.description" placeholder="Описание" class="input-field"></textarea>
      <input type="date" v-model="editedCard.deadline" class="input-field">
      <div class="modal-buttons">
        <button @click="saveCard" class="save">Сохранить</button>
        <button @click="closeModal" class="cancel">Отмена</button>
      </div>
    </div>
  `,
  data() {
    return {
      editedCard: { ...this.card },
    };
  },
  methods: {
    saveCard() {
      this.$emit('save-card', this.editedCard);
    },
    closeModal() {
      this.$emit('close-modal');
    },
  },
});

Vue.component('return-card-form', {
  props: {
    card: Object,
  },
  template: `
    <div class="return-card-form">
      <h2>Укажите причину возврата</h2>
      <textarea v-model="returnReason" placeholder="Причина возврата" class="input-field"></textarea>
      <div class="modal-buttons">
        <button @click="confirmReturn" class="save">Подтвердить</button>
        <button @click="closeModal" class="cancel">Отмена</button>
      </div>
    </div>
  `,
  data() {
    return {
      returnReason: '',
    };
  },
  methods: {
    confirmReturn() {
      this.$emit('confirm-return', { ...this.card, returnReason: this.returnReason });
      this.closeModal();
    },
    closeModal() {
      this.$emit('close-modal');
    },
  },
});

new Vue({
  el: '#app',
  data() {
    return {
      plannedTasks: [],
      inProgressTasks: [],
      testingTasks: [],
      completedTasks: [],
      isEditModalOpen: false,
      isReturnModalOpen: false,
      selectedCard: null,
    };
  },
  methods: {
    handleAddCard(newCard) {
      this.plannedTasks.push(newCard);
    },
    openEditModal(card) {
      this.selectedCard = card;
      this.isEditModalOpen = true;
    },
    closeEditModal() {
      this.isEditModalOpen = false;
    },
    openReturnModal(card) {
      this.selectedCard = card;
      this.isReturnModalOpen = true;
    },
    closeReturnModal() {
      this.isReturnModalOpen = false;
    },
    handleSaveCard(updatedCard) {
      updatedCard.lastEdited = new Date().toLocaleString();
      this.plannedTasks = this.plannedTasks.map(c => (c.id === updatedCard.id ? updatedCard : c));
      this.inProgressTasks = this.inProgressTasks.map(c => (c.id === updatedCard.id ? updatedCard : c));
      this.testingTasks = this.testingTasks.map(c => (c.id === updatedCard.id ? updatedCard : c));
      this.completedTasks = this.completedTasks.map(c => (c.id === updatedCard.id ? updatedCard : c));
      this.closeEditModal();
    },
    handleDeleteCard(card) {
      this.plannedTasks = this.plannedTasks.filter(c => c.id !== card.id);
      this.inProgressTasks = this.inProgressTasks.filter(c => c.id !== card.id);
      this.testingTasks = this.testingTasks.filter(c => c.id !== card.id);
      this.completedTasks = this.completedTasks.filter(c => c.id !== card.id);
    },
    handleMoveCard(card) {
      if (card.status === 'planned') {
        this.plannedTasks = this.plannedTasks.filter(c => c.id !== card.id);
        card.status = 'inProgress';
        this.inProgressTasks.push(card);
      } else if (card.status === 'inProgress') {
        this.inProgressTasks = this.inProgressTasks.filter(c => c.id !== card.id);
        card.status = 'testing';
        this.testingTasks.push(card);
      } else if (card.status === 'testing') {
        this.testingTasks = this.testingTasks.filter(c => c.id !== card.id);
        card.status = 'completed';
        this.checkDeadline(card); // Проверяем дедлайн при перемещении в четвертый столбец
        this.completedTasks.push(card);
      }
    },
    checkDeadline(card) {
      const currentDate = new Date();
      const deadlineDate = new Date(card.deadline);
      card.isOverdue = currentDate > deadlineDate; // Устанавливаем статус просрочки
    },
    handleReturnCard(card) {
      this.openReturnModal(card);
    },
    confirmReturn(updatedCard) {
      this.testingTasks = this.testingTasks.filter(c => c.id !== updatedCard.id);
      updatedCard.status = 'inProgress';
      this.inProgressTasks.push(updatedCard);
      this.closeReturnModal();
    },
  },
});