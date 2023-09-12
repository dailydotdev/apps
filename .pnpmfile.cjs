function switchDependency(pkg, dep, newDep) {
  if (pkg.dependencies[dep]) {
    pkg.dependencies[dep] = newDep;
  }
}

function readPackage(pkg) {
  if (pkg.dependencies) {
    switchDependency(pkg, '@growthbook/growthbook', 'https://gitpkg.now.sh/dailydotdev/growthbook/packages/sdk-js?a0d1a3add257acdbf5353dfd690547feebbada92');
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
