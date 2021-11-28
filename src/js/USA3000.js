import API from './API';

export default class USA3000 {
  constructor(el) {
    this.el = el;
    this.sendForm = this.el.querySelector('.send');
    this.searchForm = this.el.querySelector('.search');
    this.attachForm = this.el.querySelector('.file');
    this.geoButton = this.sendForm.querySelector('.geoButton');
    this.textInput = this.sendForm.querySelector('.textInput');
    this.searchInput = this.searchForm.querySelector('.searchInput');
    this.field = this.el.querySelector('.messages');
    this.favorite = this.el.querySelector('.favoritesField');
    this.search = this.el.querySelector('.searchResult');
    this.ws = new WebSocket('wss:https://diploma-kxrxll.herokuapp.com/');
  }

  init() {
    this.sendForm.addEventListener('submit', this.sendMessage.bind(this));
    this.searchForm.addEventListener('submit', this.searchMessage.bind(this));
    this.attachForm.addEventListener('change', this.sendAttach.bind(this));
    this.geoButton.addEventListener('click', this.sendGeo.bind(this));
    this.ws.addEventListener('open', () => {
      this.ws.send('hello');
    });
    this.ws.addEventListener('message', (evt) => {
      const incomingArr = evt.data;
      const incomingArrParsed = JSON.parse(incomingArr);
      console.log(incomingArrParsed);
      this.drawMessages(incomingArrParsed);
    });
    this.ws.addEventListener('close', async (evt) => {
      console.log('connection closed', evt);
    });

    this.ws.addEventListener('error', () => {
      console.log('error');
    });
  }

  drawMessages(arr) {
    this.field.innerHTML = '';
    this.favorite.innerHTML = '';
    for (const item of arr) {
      const newEl = document.createElement('div');
      newEl.classList.add('message');
      newEl.dataset.id = item.id;
      if (item.type === 'text' || item.type === 'geo') {
        newEl.innerHTML = `
          <p class="text">${item.message}</p>
          <button class="${item.favorite ? 'favoriteButtonOn' : 'favoriteButtonOff'} favButton"><3</button>
        `;
        this.field.appendChild(newEl);
      } else if (item.type === 'link') {
        newEl.innerHTML = `
          <a class="anchor" href='${item.message}'>${item.message}</a>
          <button class="${item.favorite ? 'favoriteButtonOn' : 'favoriteButtonOff'} favButton"><3</button>
        `;
        this.field.appendChild(newEl);
      } else if (item.type === 'file') {
        newEl.innerHTML = `
          <img class="image" src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYN2iKuaJSIZZwk0Oc2CJkZiGpsCdEgF933g&usqp=CAU' alt='${item.message}'>
          <button class="downloadButton" type="file">Download</button>
          <button class="${item.favorite ? 'favoriteButtonOn' : 'favoriteButtonOff'} favButton"><3</button>
        `;
        newEl.querySelector('.downloadButton').addEventListener('click', this.download.bind(this));
        this.field.appendChild(newEl);
      }
      if (item.favorite) {
        const favoriteEl = document.createElement('div');
        favoriteEl.classList.add('favorite');
        favoriteEl.textContent = item.message.slice(0, 18);
        this.favorite.appendChild(favoriteEl);
      }
      newEl.querySelector('.favButton').addEventListener('click', this.favoriteSwitch.bind(this));
      this.field.scrollTop = this.field.scrollHeight;
    }
  }

  async favoriteSwitch(evt) {
    evt.preventDefault();
    const { id } = evt.target.closest('.message').dataset;
    let message = {};
    if (evt.target.classList.contains('favoriteButtonOff')) {
      message = {
        id,
        isFavorite: true,
      };
    } else {
      message = {
        id,
        isFavorite: false,
      };
    }
    const api = new API('https://diploma-kxrxll.herokuapp.com/favorite');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      this.textInput.value = '';
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
  }

  async sendMessage(evt) {
    evt.preventDefault();
    let message = {};
    if (this.textInput.value.startsWith('www')
    || this.textInput.value.startsWith('http')) {
      message = {
        id: Math.floor(Math.random() * 10000),
        type: 'link',
        message: this.textInput.value,
        favorite: false,
      };
    } else {
      message = {
        id: Math.floor(Math.random() * 10000),
        type: 'text',
        favorite: false,
        message: this.textInput.value,
      };
    }
    const api = new API('https://diploma-kxrxll.herokuapp.com/newmessage');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      this.textInput.value = '';
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
  }

  async sendAttach(evt) {
    evt.preventDefault();
    const file = this.attachForm.querySelector('input').files[0];
    const data = new FormData();
    data.append('file', file);
    const api = new API('https://diploma-kxrxll.herokuapp.com/download');
    const response = await api.put(data);
    if (response.status === 200 && response.ok) {
      await console.log(response);
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
  }
  /*
    const message = {
      id: Math.floor(Math.random() * 10000),
      type: 'file',
      message: file.name,
      attach: file,
      favorite: false,
    };
    const api = new API('http://localhost:7070/newmessage');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      this.textInput.value = '';
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
    */

  async sendGeo(evt) {
    evt.preventDefault();
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const { latitude, longitude } = position.coords;
    const geo = `[${latitude}, ${longitude}]`;
    const message = {
      id: Math.floor(Math.random() * 10000),
      type: 'geo',
      message: geo,
      favorite: false,
    };
    const api = new API('https://diploma-kxrxll.herokuapp.com/newmessage');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      this.textInput.value = '';
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('New message!');
      }
    }
  }

  async searchMessage(evt) {
    evt.preventDefault();
    this.search.innerHTML = '';
    const message = {
      str: this.searchInput.value,
    };
    const api = new API('https://diploma-kxrxll.herokuapp.com/search');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      const parsedResponse = await response.json();
      for (const item of parsedResponse) {
        const searchEl = document.createElement('div');
        searchEl.classList.add('result');
        searchEl.textContent = item.message.slice(0, 10);
        this.search.appendChild(searchEl);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async download(evt) {
    evt.preventDefault();
    const { id } = evt.target.closest('.message').dataset;
    // eslint-disable-next-line no-unused-vars
    const message = { id };
    /*
    const api = new API('http://localhost:7070/download');
    const response = await api.send(message);
    if (response.status === 200 && response.ok) {
      const parsedResponse = await response.json();
      console.log(parsedResponse);
    }
    */
  }
}
