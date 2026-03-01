import { LitElement, html } from 'lit';
import styles from './styles.css';

export class MyElement extends LitElement {
  static styles = styles;

  render() {
    return html`
      <h1>Hello from Parcel + lit-css!</h1>
      <p>If this is styled with hotpink, the plugin works!</p>
    `;
  }
}

customElements.define('my-element', MyElement);
