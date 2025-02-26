function switchDependency(pkg, dep, newDep) {
  if (pkg.dependencies[dep]) {
    pkg.dependencies[dep] = newDep;
  }
}

function readPackage(pkg) {
  if (pkg.dependencies) {
    switchDependency(pkg, '@growthbook/growthbook', 'https://gitpkg.now.sh/dailydotdev/growthbook/packages/sdk-js?e354fcf41b2b3f67590294a0e2cdfb56044d7a1e');
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
