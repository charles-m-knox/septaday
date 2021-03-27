# Septaday

7 things to do every day that will make your life better.

## Article

This app has a companion guide, which you can find here: https://charlesmknox.com/apps/septaday/

The guide contains more specifics about the app itself, as well as scientific research references that provide foundational confidence in each of the 7 daily tasks.

## Dev notes

This app uses [Expo's managed workflow](https://docs.expo.io/distribution/building-standalone-apps/) to build a React Native app that should work on all platforms.

Normally I'm pretty verbose with my readme documents, but this app is pretty simple - here are the core features:

* sqlite-based local data storage on the phone
* simple historical journal for task completion every day
* sqlite import/export using the document picker and native "share with" menu
### References

* https://docs.expo.io/versions/latest/sdk/sqlite/
* https://docs.expo.io/versions/latest/sdk/sqlite/#importing-an-existing-database
* https://github.com/expo/examples/blob/master/with-sqlite/App.js
