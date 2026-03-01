import { LitElement } from 'lit';

import styles from './styles.css' with { type: 'css' };

export class MyEl extends LitElement {
  static readonly styles = [styles];
}
