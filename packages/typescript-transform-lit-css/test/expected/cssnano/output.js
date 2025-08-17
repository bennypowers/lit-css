import { LitElement } from 'lit';
import { css } from "lit";
const styles = css `html{display:block}html body{display:flex}:is(html body)::part(thing){color:blue;padding:1px 2px 3px 4px}`;
export class MyEl extends LitElement {
    static styles = [styles];
}
