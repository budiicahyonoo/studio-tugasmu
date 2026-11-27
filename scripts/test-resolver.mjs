import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
// Next supports extensionless application imports; native Node's test loader does not.
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (specifier.startsWith("next/") && !specifier.endsWith(".js"))
        return nextResolve(specifier + ".js", context);
      if (specifier.startsWith(".")) {
        const url = new URL(specifier, context.parentURL);
        if (existsSync(fileURLToPath(url) + ".js"))
          return nextResolve(url.href + ".js", context);
      }
      throw error;
    }
  },
});
