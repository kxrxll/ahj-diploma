export default class API {
  constructor(url) {
    this.url = url;
    this.contentTypeHeader = { 'Content-Type': 'application/json' };
  }

  load() {
    return fetch(this.url);
  }

  send(message) {
    return fetch(this.url, {
      body: JSON.stringify(message),
      method: 'POST',
      headers: this.contentTypeHeader,
    });
  }

  put(formData) {
    return fetch(this.url, {
      body: formData,
      method: 'PUT',
    });
  }
}
