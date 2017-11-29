var obtains = [
  `${__dirname}/button.js`,
  `${__dirname}/cards.js`,
  `${__dirname}/dropdown.js`,
  `${__dirname}/menu.js`,
];

obtain(obtains, ({ Button }, { Card }, { Dropdown }, { MenuBar })=> {
  exports.Button = Button;
  exports.Card = Card;
  exports.Dropdown = Dropdown;
  exports.MenuBar = MenuBar;
});
