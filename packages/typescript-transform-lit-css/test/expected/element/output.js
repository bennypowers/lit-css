import { LitElement } from 'lit';
import { css } from "lit";
const styles = css `html {
  display: block;
}
`;
export class MyEl extends LitElement {
    static styles = [styles];
}
