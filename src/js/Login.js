import API from './API';
import Chat from './Chat';

export default class Login {
  constructor(el) {
    this.section = el;
    this.form = el.querySelector('.popupform');
  }

  init() {
    this.form.addEventListener('submit', async (evt) => {
      evt.preventDefault();
      const formData = { name: evt.target.querySelector('.authname').value };
      const api = new API('https://chat-kxrxll.herokuapp.com/login');
      const response = await api.send(formData);
      if (response.status === 204 && response.ok) {
        this.section.classList.add('hide');
        const chatEl = document.querySelector('.chat');
        chatEl.classList.remove('hide');
        const chat = new Chat(chatEl, evt.target.querySelector('.authname').value);
        chat.init();
      } else {
        alert('User exists!');
      }
    });
  }
}
