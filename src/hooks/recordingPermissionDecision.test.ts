import { describe, expect, it } from "vitest";
import { decideRecordingPermission } from "./recordingPermissionDecision";

describe("decideRecordingPermission", () => {
	it("blocks recording when Screen Recording permission is missing", () => {
		expect(
			decideRecordingPermission({
				screenRecordingGranted: false,
				accessibilityStatusAvailable: true,
				accessibilityTrusted: true,
			}),
		).toMatchObject({ allowed: false, diagnostic: expect.stringContaining("Screen Recording") });
	});

	it("allows recording with a diagnostic when Accessibility is denied", () => {
		expect(
			decideRecordingPermission({
				screenRecordingGranted: true,
				accessibilityStatusAvailable: true,
				accessibilityTrusted: false,
			}),
		).toMatchObject({ allowed: true, diagnostic: expect.stringContaining("Accessibility") });
	});

	it("allows recording with a diagnostic when Accessibility status cannot be read", () => {
		expect(
			decideRecordingPermission({
				screenRecordingGranted: true,
				accessibilityStatusAvailable: false,
				accessibilityTrusted: false,
			}),
		).toMatchObject({ allowed: true, diagnostic: expect.stringContaining("status is unavailable") });
	});

	it("allows recording without a warning when both permissions are ready", () => {
		expect(
			decideRecordingPermission({
				screenRecordingGranted: true,
				accessibilityStatusAvailable: true,
				accessibilityTrusted: true,
			}),
		).toEqual({ allowed: true });
	});
});
