const { withMainActivity } = require("@expo/config-plugins");

module.exports = function withHealthConnectActivity(config) {
  return withMainActivity(config, (mod) => {
    let contents = mod.modResults.contents;

    // 1. Add import if missing
    const importLine =
      "import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate";
    if (!contents.includes(importLine)) {
      // Insert after the package declaration line
      contents = contents.replace(
        /^(package .+)(\r?\n)/m,
        `$1$2\n${importLine}\n`
      );
    }

    // 2. Add Bundle import if missing (needed for onCreate parameter)
    const bundleImport = "import android.os.Bundle";
    if (!contents.includes(bundleImport)) {
      contents = contents.replace(
        /^(package .+)(\r?\n)/m,
        `$1$2\n${bundleImport}\n`
      );
    }

    const delegateCall =
      "HealthConnectPermissionDelegate.setPermissionDelegate(this)";

    // 3a. If onCreate already exists, inject after super.onCreate
    if (contents.includes("super.onCreate(savedInstanceState)")) {
      if (!contents.includes(delegateCall)) {
        contents = contents.replace(
          /super\.onCreate\(savedInstanceState\)/,
          `super.onCreate(savedInstanceState)\n    ${delegateCall}`
        );
      }
    } else {
      // 3b. No onCreate — add a full override before the last closing brace
      if (!contents.includes(delegateCall)) {
        const onCreateBlock = [
          "",
          "  override fun onCreate(savedInstanceState: Bundle?) {",
          "    super.onCreate(savedInstanceState)",
          `    ${delegateCall}`,
          "  }",
        ].join("\n");

        // Insert before the final closing brace of the class
        const lastBrace = contents.lastIndexOf("}");
        contents =
          contents.slice(0, lastBrace) +
          onCreateBlock +
          "\n" +
          contents.slice(lastBrace);
      }
    }

    mod.modResults.contents = contents;
    return mod;
  });
};
