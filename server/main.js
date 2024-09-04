import { Meteor } from 'meteor/meteor';
import { LinksCollection } from '/imports/api/links';
import { ServiceConfiguration } from 'meteor/service-configuration';

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
}

Meteor.startup(async () => {
  // Nếu collection Links trống, thêm một số dữ liệu
  if (await LinksCollection.find().countAsync() === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://www.meteor.com/tutorials/react/creating-an-app',
    });

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    });

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    });

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    });
  }

  // Publish toàn bộ collection Links tới tất cả các client
  Meteor.publish("links", function () {
    return LinksCollection.find();
  });

  // Cấu hình Google OAuth
  await ServiceConfiguration.configurations.updateAsync(
    { service: 'google' },
    {
      $set: {
        clientId: '',
        secret: '',
        loginStyle: 'popup',
      },
    },
    { upsert: true }
  );
  await ServiceConfiguration.configurations.updateAsync(
    { service: 'facebook' },
    {
      $set: {
        appId: '',
        secret: '',
        loginStyle: 'popup',
      },
    },
    { upsert: true }
  );


});
Meteor.startup(() => {
  // Cấu hình trustid OAuth
  ServiceConfiguration.configurations.upsert(
    { service: 'trustid' },
    {
      $set: {
        clientId: '<Your trustid Client ID>',
        secret: '<Your trustid Client Secret>',
        loginStyle: 'popup',
      },
    }
  );
});
