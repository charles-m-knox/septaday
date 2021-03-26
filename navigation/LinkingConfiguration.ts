import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          TabOne: {
            screens: {
              Tasks: 'one',
            },
          },
          TabTwo: {
            screens: {
              About: 'two',
            },
          },
        },
      },
      NotFound: '*',
    },
  },
};
