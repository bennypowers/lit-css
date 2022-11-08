// test/😁-FIXTURES/native/styles.css
var sheet = new CSSStyleSheet();
sheet.replaceSync(`html {
  display: block;
}
`);
var styles_default = sheet;
export {
  styles_default as default,
  sheet
};
