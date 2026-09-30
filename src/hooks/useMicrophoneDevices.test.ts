import { describe, expect, it } from "vitest";
import { resolveMicrophoneDeviceId } from "./useMicrophoneDevices";

const devices = [
	{ deviceId: "default", label: "Default", groupId: "default-group" },
	{ deviceId: "continuity-iphone", label: "Dylan's iPhone", groupId: "iphone-group" },
];

describe("resolveMicrophoneDeviceId", () => {
	it("does not select the first physical microphone when the saved device is unavailable", () => {
		expect(resolveMicrophoneDeviceId(devices, "missing-mic", "default")).toBe("default");
	});

	it("keeps a current physical microphone that is still connected", () => {
		expect(resolveMicrophoneDeviceId(devices, undefined, "continuity-iphone")).toBe(
			"continuity-iphone",
		);
	});
});
