function switchDependency(pkg, dep, newDep) {
  if (pkg.dependencies[dep]) {
    pkg.dependencies[dep] = newDep;
  }
}

function readPackage(pkg) {
  if (pkg.dependencies) {
    switchDependency(pkg, '@growthbook/growthbook', 'https://gitpkg.now.sh/dailydotdev/growthbook/packages/sdk-js?b8f31f9e80879fe2bcc42b275087b50e1357f1cb');
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
