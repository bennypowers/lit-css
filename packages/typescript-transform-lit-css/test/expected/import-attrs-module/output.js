// Tests CSS import attributes with inline: false
// Unlike import-attrs (which uses inline: true), this generates a separate .css.js file
// instead of inlining the CSS content directly into the JavaScript output
import { LitElement } from 'lit';
import styles from "./styles.css.js";
export class MyEl extends LitElement {
    static styles = [styles];
}
