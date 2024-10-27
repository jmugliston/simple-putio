PACKAGE_VERSION=`npm show ./ version`

echo "Building release v${PACKAGE_VERSION}..."

npm run build > /dev/null
cd dist
zip -r ../simple-putio-v${PACKAGE_VERSION}.zip ./ > /dev/null

echo "Done"