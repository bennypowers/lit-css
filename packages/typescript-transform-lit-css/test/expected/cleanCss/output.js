import { LitElement } from 'lit';
import { css } from "lit";
const styles = css `html{display:block}html body{display:flex}html body::part(thing){color:#00f}`;
export class MyEl extends LitElement {
    static styles = [styles];
}
