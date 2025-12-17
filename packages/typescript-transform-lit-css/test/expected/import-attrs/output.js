import { LitElement } from 'lit';
import { css } from "lit";
const styles = css `:host {
  display: block;
  color: red;
}
`;
export class MyEl extends LitElement {
    static styles = [styles];
}
