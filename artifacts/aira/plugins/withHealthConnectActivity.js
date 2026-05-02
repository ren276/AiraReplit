const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withHealthConnectActivity(config) {
  return withMainActivity(config, (mod) => {
    let contents = mod.modResults.contents;

    const delegateCall =
      "HealthConnectPermissionDelegate.setPermissionDelegate(this)";

    // Already applied — nothing to do
    if (contents.includes(delegateCall)) {
      return mod;
    }

    // 1. Add HealthConnectPermissionDelegate import
    const importLine =
      "import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate";
    if (!contents.includes(importLine)) {
      contents = contents.replace(
        /^(package .+)(\r?\n)/m,
        `$1$2\n${importLine}\n`
      );
    }

    // 2. Add android.os.Bundle import (needed if we have to add onCreate)
    const bundleImport = "import android.os.Bundle";
    if (!contents.includes(bundleImport)) {
      contents = contents.replace(
        /^(package .+)(\r?\n)/m,
        `$1$2\n${bundleImport}\n`
      );
    }

    // 3a. onCreate exists — inject after ANY super.onCreate(...) call
    if (contents.includes("fun onCreate(")) {
      // Match super.onCreate with any argument
      contents = contents.replace(
        /(super\.onCreate\([^)]*\))/,
        `$1\n    ${delegateCall}`
      );
    } else {
      // 3b. No onCreate at all — insert a full override before the last closing brace
      const onCreateBlock = [
        "",
        "  override fun onCreate(savedInstanceState: Bundle?) {",
        "    super.onCreate(savedInstanceState)",
        `    ${delegateCall}`,
        "  }",
      ].join("\n");

      const lastBrace = contents.lastIndexOf("}");
      contents =
        contents.slice(0, lastBrace) +
        onCreateBlock +
        "\n" +
        contents.slice(lastBrace);
    }

    mod.modResults.contents = contents;
    return mod;
  });
};
