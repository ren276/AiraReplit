const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withHealthConnectActivity(config) {
  return withMainActivity(config, (mod) => {
    let contents = mod.modResults.contents;

    const importLine =
      "import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate";

    if (!contents.includes(importLine)) {
      contents = contents.replace(
        /^(package .+)$/m,
        `$1\n\n${importLine}`
      );
    }

    const delegateCall =
      "HealthConnectPermissionDelegate.setPermissionDelegate(this)";

    if (!contents.includes(delegateCall)) {
      contents = contents.replace(
        /super\.onCreate\(savedInstanceState\)/,
        `super.onCreate(savedInstanceState)\n    ${delegateCall}`
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};
