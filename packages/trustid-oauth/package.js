Package.describe({
    name: 'trustid-oauth',
    version: '0.0.1',
    summary: 'OAuth flow for trustid',
    documentation: 'README.md'
  });
  
  Package.onUse(function(api) {
    api.use('oauth');
    api.use('service-configuration');
    api.use('accounts-base');
    api.mainModule('trustid_oauth.js');
  });