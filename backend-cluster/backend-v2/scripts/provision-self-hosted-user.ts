import "reflect-metadata";
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { config } from "../src/config/config";
import { buildAppLayers } from "../src/foundation/factory";

/** Operator-only stdin interface. No public registration or credential logging. */
async function main() {
  if (!config.selfHosted) throw new Error("SELF_HOSTED must be enabled");
  const input = JSON.parse(readFileSync(0, "utf8")) as {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  if (!input.email || !input.username || input.password.length < 20) {
    throw new Error(
      "Supply email, username and a random password of at least 20 characters",
    );
  }
  const layers = await buildAppLayers(config);
  const exists = await layers.database.models.user.getByMail(
    layers.database.db, input.email,
  );
  if (!exists) {
    // registerUser accepts the hash produced by the normal signup OTP flow.
    await layers.services.auth.registerUser({
      ...input,
      password: await bcrypt.hash(input.password, 10),
      ip: "127.0.0.1",
    });
  }
  process.stdout.write("Account ready.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    process.stderr.write(error instanceof Error ? error.name : "Provisioning failed");
    process.exit(1);
  });
