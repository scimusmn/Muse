obtain([], ()=> {

  function Color(col) {

    col = col.map((val)=>Math.floor(val));

    col.invert = ()=>new Color(col.map((val)=>(255 - val)));

    col.styleString = ()=>`rgb(${col[0]}, ${col[1]}, ${col[2]})`;

    col.scale = (s)=>new Color(col.map((val)=>s * val));

    return col;
  }

  exports.Color = Color;

  exports.rainbow = (note, span)=> {
    const third = span / 3;
    var r = 1, g = 0, b = 0;
    var c = note % span;
    var k = 255 - (note % third) * (255 / third);
    if (c >= 2 * third) r = 0, g = 0, b = 1;
    else if (c >= third) r = 0, g = 1, b = 0;
    else r = 1, g = 0, b = 0;

    return new Color([(r * (255 - k) + g * k), (g * (255 - k) + b * k), (b * (255 - k) + r * k)]);
  };

  provide(exports);
});
