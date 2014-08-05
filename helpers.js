function updateBowerJson(bowerJson, pkg)
{
  bowerJson = bowerJson
    // name
    .replace(/\"name\":(.*),/, '"name": "' + pkg.name + '",')
    // version
    .replace(/\"version\":(.*),/, '"version": "' + pkg.version + '",');

  if (pkg.license) {
    // license already there
    if (bowerJson.indexOf('"license":') !== -1) {
      bowerJson = bowerJson.replace(/\"license\":(.*),/, '"license": "' + pkg.license + '",');
    }
    // license has to be added
    else {
      bowerJson = bowerJson.replace('"version": "' + pkg.version + '",\n', '"version": "' + pkg.version + '",\n"license": "' + pkg.license + '",\n');
    }
  }
  // license was removed
  else {
    bowerJson = bowerJson.replace(/\"license\":(.*),/, '');
  }

  return bowerJson;
}
module.exports.updateBowerJson = updateBowerJson;