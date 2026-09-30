import { useEffect, useState } from "react";

export interface MicrophoneDevice {
	deviceId: string;
	label: string;
	groupId: string;
}

export function resolveMicrophoneDeviceId(
	devices: MicrophoneDevice[],
	preferredDeviceId: string | undefined,
	currentDeviceId: string,
) {
	if (preferredDeviceId && devices.some((device) => device.deviceId === preferredDeviceId)) {
		return preferredDeviceId;
	}

	if (devices.some((device) => device.deviceId === currentDeviceId)) {
		return currentDeviceId;
	}

	// Never activate an arbitrary physical input merely because it is first in
	// the enumeration order. The user can explicitly choose one from the list.
	return "default";
}

export function useMicrophoneDevices(enabled: boolean = true, preferredDeviceId?: string) {
	const [devices, setDevices] = useState<MicrophoneDevice[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string>("default");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		let mounted = true;

		const loadDevices = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const allDevices = await navigator.mediaDevices.enumerateDevices();
				const audioInputs = allDevices
					.filter((device) => device.kind === "audioinput")
					.map((device) => ({
						deviceId: device.deviceId,
						label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
						groupId: device.groupId,
					}));

				if (mounted) {
					setDevices(audioInputs);
					setSelectedDeviceId((currentDeviceId) =>
						resolveMicrophoneDeviceId(audioInputs, preferredDeviceId, currentDeviceId),
					);
					setIsLoading(false);
				}
			} catch (error) {
				if (mounted) {
					const message =
						error instanceof Error
							? error.message
							: "Failed to enumerate audio devices";
					setError(message);
					setIsLoading(false);
					console.error("Error loading microphone devices:", error);
				}
			}
		};

		void loadDevices();

		const handleDeviceChange = () => {
			void loadDevices();
		};

		navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

		return () => {
			mounted = false;
			navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
		};
	}, [enabled, preferredDeviceId]);

	return {
		devices,
		selectedDeviceId,
		setSelectedDeviceId,
		isLoading,
		error,
	};
}
