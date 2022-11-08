const sheet = new CSSStyleSheet();
sheet.replaceSync(`html {
  display: block;
}
`);

export { sheet as default, sheet };
