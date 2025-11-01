import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import PocketBase, { type RecordModel } from "pocketbase";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// serializeNonPOJOs for Pocketbase
export const serializeNonPOJOs = (obj: any) => {
	return structuredClone(obj);
}

export const getFileUrl = (fileRecord: RecordModel, fileName: string) => {
	const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
	const fileUrl = pb.files.getURL(fileRecord, fileName);
	return fileUrl;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
