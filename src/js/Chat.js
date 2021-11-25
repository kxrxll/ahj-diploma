import API from './API';

export default class Chat {
  constructor(el, user) {
    this.user = user;
    this.section = el;
    this.users = [];
    this.messages = [];
    this.form = el.querySelector('.chat');
    this.usersSection = el.querySelector('.users');
    this.input = el.querySelector('.newmessage');
    this.field = el.querySelector('.chatfield');
    this.ws = new WebSocket('wss://chat-kxrxll.herokuapp.com/ws');
  }

  async init() {
    // Websocket setup
    this.ws.addEventListener('open', () => {
      this.ws.send('hello');
    });

    this.ws.addEventListener('message', (evt) => {
      const incomingArr = evt.data;
      [this.users, this.messages] = JSON.parse(incomingArr);
      this.drawUsers(this.users);
      console.log([this.users, this.messages]);
    });

    this.ws.addEventListener('close', async (evt) => {
      console.log('connection closed', evt);
    });

    this.ws.addEventListener('error', () => {
      console.log('error');
    });

    // Send new user data
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('New user!');
    }

    // Events
    this.input.closest('form').addEventListener('submit', this.sendMessage.bind(this));
  }

  async sendMessage(evt) {
    evt.preventDefault();
    const message = {
      message: this.input.value,
      from: this.user,
      to: this.section.querySelector('.selected').dataset.name,
      date: new Date(),
    };
    const api = new API('https://chat-kxrxll.herokuapp.com/newmessage');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      this.input.value = '';
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
  }

  drawUsers(users) {
    let selected = 'nobody';
    if (this.section.querySelector('.selected')) {
      selected = this.section.querySelector('.selected').textContent.trim();
    }
    this.usersSection.innerHTML = `<div class="user you">
        <div class="userpic"></div>
        <p class="username">You</p>
      </div>`;
    for (const user of users) {
      if (user.name !== this.user) {
        const newEl = document.createElement('div');
        newEl.innerHTML = `
        <div class="user" data-name='${user.name}' data-id='${user.id}'>
          <div class="userpic"></div>
          <p class="username">${user.name}</p>
        </div>
      `;
        newEl.addEventListener('click', this.drawMessages.bind(this));
        this.usersSection.appendChild(newEl);
      }
    }
    const usersArr = this.section.querySelectorAll('.user');
    for (const item of usersArr) {
      if (item.textContent.trim() === selected) {
        item.classList.add('selected');
        item.click();
      }
    }
  }

  drawMessages(evt) {
    this.input.disabled = false;
    let selected = '';
    if (evt) {
      const users = Array.from(this.section.querySelectorAll('.user'));
      for (const item of users) {
        item.classList.remove('selected');
      }
      evt.target.closest('.user').classList.add('selected');
      selected = evt.target.closest('.user').textContent.trim();
    } else {
      selected = this.section.querySelector('.selected').textContent.trim();
    }
    const { messages } = this;
    this.field.innerHTML = '';
    for (const message of messages) {
      if (message.from === selected && message.to === this.user) {
        const newEl = document.createElement('div');
        newEl.innerHTML = `
          <div class="message incomingmessage">
              <p class="messagename">${message.from}</p>
              <p class="messagedate">${message.date.toLocaleString()}</p>
              <p class="messagetext">${message.message}</p>
            </div>
          `;
        this.field.appendChild(newEl);
      } else if (message.from === this.user && message.to === selected) {
        const newEl = document.createElement('div');
        newEl.innerHTML = `
          <div class="message">
              <p class="messagename">You</p>
              <p class="messagedate">${message.date.toLocaleString()}</p>
              <p class="messagetext">${message.message}</p>
            </div>
          `;
        this.field.appendChild(newEl);
      }
    }
  }
}
