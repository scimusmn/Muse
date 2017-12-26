var obtains = [
  `${__dirname}/button.js`,
  `${__dirname}/cards.js`,
  `${__dirname}/dropdown.js`,
  `${__dirname}/menu.js`,
  `${__dirname}/growl.js`,
];

obtain(obtains, ({ Button }, { Card }, { Dropdown }, { MenuBar }, { Growl })=> {
  exports.Button = Button;
  exports.Card = Card;
  exports.Dropdown = Dropdown;
  exports.MenuBar = MenuBar;
  exports.Growl = Growl;
  //exports.Keyboard = Keyboard;
});
