obtain(['µ/piFig/hotspot.js', 'µ/piFig/wifi.js', './config.js', 'fs'], (hotspot, wifi, { config }, fs)=> {
  var pfg = config.piFig;
  if (pfg) {
    var confDir = µdir + '/piFig/currentConfig.json';
    let curCfg = {};
    if (fs.existsSync(confDir)) {
      let data = fs.readFileSync(confDir); //file exists, get the contents
      curCfg = JSON.parse(data);
    }

    function configsMatch(cur, cfg) {
      if (!cur) return false;
      else {
        let ret = true;
        for (key in cfg) {
          if (cfg.hasOwnProperty(key)) {
            if (!cur[key] || cur[key] != cfg[key]) ret = false;
          }
        }

        return ret;
      }
    }

    if (pfg.wifiHotspot && !configsMatch(curCfg.wifiHotspot, pfg.wifiHotspot)) {
      console.log('Configuring wifi hotspot...');
      hotspot.configure(pfg.wifiHotspot);
      curCfg.wifiHotspot = pfg.wifiHotspot;
    } else if (pfg.wifi && !configsMatch(curCfg.wifi, pfg.wifi)) {
      console.log('Configuring wifi hotspot...');
      wifi.configure(pfg.wifi);
      curCfg.wifi = pfg.wifi;
    } else if (pfg.smoothShutdown) {
      console.log('smooth shutdown');
    }

    fs.writeFileSync(confDir, JSON.stringify(curCfg));
  }
});
