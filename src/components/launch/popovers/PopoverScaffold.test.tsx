import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { useAudioLevelMeter } = vi.hoisted(() => ({
	useAudioLevelMeter: vi.fn(() => ({ level: 0 })),
}));

vi.mock("@/hooks/useAudioLevelMeter", () => ({ useAudioLevelMeter }));
vi.mock("@heroui/react", () => ({
	ToggleButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock("@/components/ui/button", () => ({
	Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
vi.mock("@/components/ui/popover", () => ({
	Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/icons", () => ({
	MicrophoneIcon: () => <span>mic</span>,
	MicrophoneSlashIcon: () => <span>muted</span>,
}));
vi.mock("@/components/ui/audio-level-meter", () => ({
	AudioLevelMeter: () => <span>meter</span>,
}));

import { MicDeviceRow } from "./PopoverScaffold";

describe("MicDeviceRow", () => {
	beforeEach(() => {
		useAudioLevelMeter.mockClear();
	});

	it("does not open an unselected microphone for level monitoring", () => {
		renderToStaticMarkup(
			<MicDeviceRow
				device={{ deviceId: "continuity-iphone", label: "Dylan's iPhone" }}
				selected={false}
				onSelect={() => undefined}
			/>,
		);

		expect(useAudioLevelMeter).toHaveBeenCalledWith({
			enabled: false,
			deviceId: "continuity-iphone",
		});
	});

	it("monitors only the selected microphone", () => {
		renderToStaticMarkup(
			<MicDeviceRow
				device={{ deviceId: "macbook-mic", label: "MacBook Microphone" }}
				selected
				onSelect={() => undefined}
			/>,
		);

		expect(useAudioLevelMeter).toHaveBeenCalledWith({
			enabled: true,
			deviceId: "macbook-mic",
		});
	});
});
