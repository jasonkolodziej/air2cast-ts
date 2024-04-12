import { discoverChromeCast } from '$lib/server/mdns.server';

describe("mdns discovery", () => {
  it("discover Devices", () => {
    expect(discoverChromeCast).toBeDefined();
    discoverChromeCast.onAvailable(console.log)
  });
});