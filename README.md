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

### Dates

Dates seem simple enough, but are actually quite tricky. In order to properly establish when "today" is, regardless of your timezone, UTC epoch seconds are used for comparing task dates.

In order to establish a single source of truth for the tasks completed each day, every "day" is stored in the sqlite database as the UTC second value for e.g. March 30th, 2021, at 00:00:00.
### References

* https://docs.expo.io/versions/latest/sdk/sqlite/
* https://docs.expo.io/versions/latest/sdk/sqlite/#importing-an-existing-database
* https://github.com/expo/examples/blob/master/with-sqlite/App.js

## Building locally

Building locally is not required, but does provide deeper insight and control over the build process, as opposed to simply using `expo build:ios` and `expo publish`.

First, install Turtle:

```bash
npm install -g turtle-cli
# if the above fails on Mac M1 due to vips, install vips via brew:
brew install vips # this will install a LOT of stuff
# retry installing turtle-cli
```

Since we are building locally, we have to create a TLS-enabled (and trusted) file server, which will host the `dist` files from Expo, including the build manifests.

```bash
export BUILD_DOMAIN=turtlebuilder.site.com
```

Install `certbot` so we can acquire a TLS certificate:

```bash
brew install certbot
```

Acquire a TLS certificate for your domain using a DNS acme challenge - you have to run as `sudo` because certbot requires access to `/etc/letsencrypt` as well as `/var/log/letsencrypt`:

```bash
sudo certbot certonly --manual \
    -d "${BUILD_DOMAIN}" \
    --preferred-challenges dns-01 \
    --server https://acme-v02.api.letsencrypt.org/directory

# you will be prompted for DNS verification, don't press anything and continue reading.
```

This will require you to go to your DNS portal (such as Cloudflare) and create a TXT record under `_acme-challenge.turtlebuilder.site.com` with the value it specifies.

In a new terminal window, check the DNS record:

```bash
# verify that the record shows up in DNS before proceeding
dig TXT _acme-challenge.${BUILD_DOMAIN}
```

Back in your certbot terminal window, hit enter, and it should succeed.

Next, you have to update your local DNS. Your computer must *believe* that your local system's IP address is actually `${BUILD_DOMAIN}`. There are many ways to do this; the best options are:

* (local system only) - add your build domain to `/etc/hosts`, in the form of `192.168.x.y turtlebuilder.site.com`
* (network-wide) - add your build domain to your network's DNS configuration. Since everyone has a  different network setup, I can't reasonably instruct you on how to do this.

Now that you have a valid certificate for your domain and your device(s) are setup to work with your custom DNS settings, you can export your assets/bundles/manifests with Expo to the local `dist` directory - by specifying `--public-url`, we will be telling Turtle that everything is accessible via that URL when it tries to download all the assets for building:

```bash
expo export --public-url https://${BUILD_DOMAIN} --force
```

Finally, run Caddy - the `./caddy/Caddyfile` will mount `./dist` and it will be directly accessible via `https://${BUILD_DOMAIN}` after starting:

```bash
brew install caddy # if not installed
cd caddy
BUILD_DOMAIN=${BUILD_DOMAIN} sudo -E caddy run
```

## Building a simulator app

Luckily, this step is much easier than the official IPA build, since you don't have to sign the package:

```bash
turtle build:ios \
    --public-url https://${BUILD_DOMAIN}/ios-index.json \
    -t simulator
```

## Building the official IPA file

Finally, get ready to run the final build step. A few things to note about this:

* You have to have obtained a wildcard distribution certificate via the standard Xcode setup process
* You have to export the wildcard distribution certificate as a `.p12` file from Keychain Access (using a strong password) on your Mac, and then ensure that password is entered into the script below
* You have to create the provisioning profile using Apple's developer portal, and make sure that it uses your Xcode wildcard distribution certificate

```bash
#!/bin/zsh -e
echo -n "iOS p12 certificate password: "
read -s DIST_P12_PASSWORD
echo ""
echo "starting..."
EXPO_IOS_DIST_P12_PASSWORD=${DIST_P12_PASSWORD} \
    turtle build:ios \
    --public-url https://${BUILD_DOMAIN}/ios-index.json \
    --team-id 01ABC234DE \
    --dist-p12-path ../certificates/apple-distribution-xcode-wildcard.p12 \
    --provisioning-profile-path ../certificates/septaday_xcode.mobileprovision \
    -t archive
```

In my experience, during every IPA build, I get prompted for my Mac local user account password ~4 times or so, maybe more.

## Managing your distribution certificates

https://www.robincussol.com/build-standalone-expo-apk-ipa-with-turtle-cli/#53-build-ipa
https://support.magplus.com/hc/en-us/articles/203808748-iOS-Creating-a-Distribution-Certificate-and-p12-File

You have to export and use your Xcode wildcard p12 certificate. Other certificates don't seem to work, despite my best efforts.
