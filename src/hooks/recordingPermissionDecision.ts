export type RecordingPermissionDecision =
	| { allowed: false; diagnostic: string }
	| { allowed: true; diagnostic?: string };

/** Screen Recording is required; Accessibility only improves cursor telemetry. */
export function decideRecordingPermission(input: {
	screenRecordingGranted: boolean;
	accessibilityStatusAvailable: boolean;
	accessibilityTrusted: boolean;
}): RecordingPermissionDecision {
	if (!input.screenRecordingGranted) {
		return {
			allowed: false,
			diagnostic: "Screen Recording permission is missing; recording cannot start.",
		};
	}

	if (!input.accessibilityStatusAvailable) {
		return {
			allowed: true,
			diagnostic:
				"Accessibility permission status is unavailable; cursor and window telemetry may be limited.",
		};
	}

	if (!input.accessibilityTrusted) {
		return {
			allowed: true,
			diagnostic:
				"Accessibility permission is unavailable; cursor and window telemetry may be limited.",
		};
	}

	return { allowed: true };
}
