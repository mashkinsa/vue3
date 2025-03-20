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
  },
  template: `
    <div class="card">
      <h3>{{ card.title }}</h3>
      <p>{{ card.description }}</p>
      <p><strong>Дэдлайн:</strong> {{ card.deadline }}</p>
      <p><strong>Создано:</strong> {{ card.createdAt }}</p>
      <p><strong>Последнее редактирование:</strong> {{ card.lastEdited }}</p>
      <button @click="editCard">Редактировать</button>
      <button @click="deleteCard">Удалить</button>
      <button @click="moveCard">Переместить</button>
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
  },
});

Vue.component('column', {
  props: {
    title: String,
    cards: Array,
    isLocked: Boolean,
    isFull: Boolean,
    fullMessage: String,
  },
  template: `
    <div class="column" :class="{ locked: isLocked }">
      <h2>{{ title }}</h2>
      <p v-if="isFull" class="error-message">{{ fullMessage }}</p>
      <transition-group name="card-move" tag="div">
        <card
          v-for="card in cards"
          :key="card.id"
          :card="card"
          @edit-card="handleEditCard"
          @delete-card="handleDeleteCard"
          @move-card="handleMoveCard"
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
    };
  },
  methods: {
    handleAddCard(newCard) {
      this.plannedTasks.push(newCard); 
    },
    handleEditCard(card) {
      card.lastEdited = new Date().toLocaleString(); 
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
        this.completedTasks.push(card);
      }
    },
  },
});