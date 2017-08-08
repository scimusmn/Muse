obtain(['fs', 'µ/piFig/utils.js'], (fs, utils)=> {
  var writeInterfaceFile = ()=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/interfaces', '/etc/network/interfaces');
  };

  var writeHostsFile = (domainName)=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/hosts', '/etc/hosts', { DOMAIN_NAME: domainName });
  };

  var writeApdConfFile = (ssid, pass)=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/hostapd.conf', '/etc/hostapd/hostapd.conf', { SSID: ssid, PASSWORD: pass });
  };

  var writeApdDefaultsFile = ()=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/hostapd_defaults', '/etc/default/hostapd');
  };

  var writeDhcpcdConfFile = ()=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/dhcpcd.conf', '/etc/dhcpcd.conf');
  };

  var writeDnsmasqConfFile = (domainName)=> {
    utils.copyConfigFile(window.µdir + '/piFig/configFiles/dnsmasq.conf', '/etc/dnsmasq.conf', { DOMAIN_NAME: domainName });
  };

  exports.configure = (cfgObj)=> {
    writeInterfaceFile();
    writeHostsFile(cfgObj.domainName);
    writeApdConfFile(cfgObj.ssid, cfgObj.password);
    writeApdDefaultsFile();
    writeDhcpcdConfFile();
    writeDnsmasqConfFile(cfgObj.domainName);
  };

  provide(exports);
});
