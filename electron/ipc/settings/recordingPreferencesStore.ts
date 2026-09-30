import fs from "node:fs/promises";
import path from "node:path";
import { parseJsonWithByteOrderMark } from "../utils";

export interface RecordingPreferencesPatch {
	microphoneEnabled?: boolean;
	microphoneDeviceId?: string;
	systemAudioEnabled?: boolean;
	webcamEnabled?: boolean;
	webcamDeviceId?: string;
	recordingsDir?: string;
}

const operationQueues = new Map<string, Promise<void>>();

export function createRecordingPreferencesStore(filePath: string) {
	const normalizedFilePath = path.resolve(filePath);
	const getOperationQueue = () => operationQueues.get(normalizedFilePath) ?? Promise.resolve();

	const readFile = async (): Promise<Record<string, unknown>> => {
		try {
			const content = await fs.readFile(normalizedFilePath, "utf-8");
			const parsed = parseJsonWithByteOrderMark<unknown>(content);
			return parsed && typeof parsed === "object" && !Array.isArray(parsed)
				? (parsed as Record<string, unknown>)
				: {};
		} catch {
			return {};
		}
	};

	return {
		async read(): Promise<Record<string, unknown>> {
			await getOperationQueue();
			return readFile();
		},
		async update(patch: RecordingPreferencesPatch): Promise<void> {
			const operation = getOperationQueue().then(async () => {
				const existing = await readFile();
				const temporaryPath = `${normalizedFilePath}.${process.pid}.${Date.now()}.tmp`;
				try {
					await fs.writeFile(
						temporaryPath,
						JSON.stringify({ ...existing, ...patch }, null, 2),
						"utf-8",
					);
					await fs.rename(temporaryPath, normalizedFilePath);
				} catch (error) {
					await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
					throw error;
				}
			});
			operationQueues.set(
				normalizedFilePath,
				operation.catch(() => undefined),
			);
			await operation;
		},
	};
}
