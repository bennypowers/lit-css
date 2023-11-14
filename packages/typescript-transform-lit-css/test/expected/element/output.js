import { LitElement } from 'lit';
import { css } from "lit";
const styles = css `html {\n  display: block;\n}\n`;
export class MyEl extends LitElement {
    static styles = [styles];
}
