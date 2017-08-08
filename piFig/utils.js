obtain(['fs'], (fs)=> {
  exports.copyConfigFile = (src, dest, fillObj)=> {
    fs.writeFileSync(dest, '');
    fs.readFileSync(src).toString().split('\n').forEach(function(line) {
      if (fillObj) {
        var reg = /\${([^}]*)}/;
        var ln = line.toString();
        if (ln.search(reg) >= 0) {
          let repl = ln.replace(reg, (match, p1, offset, string)=> {
            if (fillObj[p1]) return fillObj[p1];
            else return '';
          });
          fs.appendFileSync(dest, repl + '\n');
        } else {
          fs.appendFileSync(dest, line.toString() + '\n');
        }
      } else fs.appendFileSync(dest, line.toString() + '\n');
    });
  };

  provide(exports);
});
