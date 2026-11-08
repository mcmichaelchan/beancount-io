import { config } from "@/config/config";
import { isAllowedOrigin } from "../allowed-origin";

describe("self-hosted browser origins", () => {
  const original = { selfHosted: config.selfHosted, url: config.dashboard.url };
  beforeEach(() => {
    config.selfHosted = true;
    config.dashboard.url = "https://ledger.example.com:26543";
  });
  afterEach(() => {
    config.selfHosted = original.selfHosted;
    config.dashboard.url = original.url;
  });
  it("accepts its configured HTTPS origin", () => {
    expect(isAllowedOrigin("https://ledger.example.com:26543")).toBe(true);
  });
  it.each([
    "https://beancount.io",
    "https://ledger.example.com",
    "http://ledger.example.com:26543",
    "https://ledger.example.com.attacker.invalid:26543",
    "null",
  ])("refuses a different origin: %s", (origin) => {
    expect(isAllowedOrigin(origin)).toBe(false);
  });
});
