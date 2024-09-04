// packages/trustid-oauth/trustid_oauth.js
import { OAuth } from 'meteor/oauth';
import { OAuthBinding } from 'meteor/oauth';

const trustid_SERVICE_NAME = 'trust';

OAuth.registerService(trustid_SERVICE_NAME, 2, null, function (query) {
  const response = HTTP.get('https://oauth.trustidapp.com/v4/oa/access_token', {
    params: {
      code: query.code,
      redirect_uri: Meteor.absoluteUrl(),
      client_id: Meteor.settings.public.trustid.clientId,
      client_secret: Meteor.settings.private.trustid.secret,
    },
  });

  const accessToken = response.data.access_token;
  const result = HTTP.get('https://graph.trustid.me/v2.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    serviceData: {
      id: result.data.id,
      accessToken,
    },
    options: { profile: { name: result.data.name } },
  };
});

Meteor.loginWithtrustid = function (options, callback) {
  OAuth.openPopup(trustid_SERVICE_NAME, options, callback);
};
