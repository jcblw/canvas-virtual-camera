PACKAGE_NAME=$(cat build/manifest.json \
  | grep short_name \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

PACKAGE_VERSION=$(cat build/manifest.json \
  | grep "\"version" \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')


zip "$PACKAGE_NAME-$PACKAGE_VERSION.zip" -r build
