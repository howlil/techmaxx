async function digest(value: string): Promise<Uint8Array> {
	const bytes = new TextEncoder().encode(value);
	return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
	if (left.length !== right.length) return false;
	let difference = 0;
	for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
	return difference === 0;
}

export async function isAuthorizedMuseRequest(request: Request, expectedToken: string | undefined): Promise<boolean> {
	if (!expectedToken) return false;
	const header = request.headers.get("authorization");
	if (!header?.startsWith("Bearer ")) return false;
	const token = header.slice("Bearer ".length).trim();
	if (!token) return false;
	return equalBytes(await digest(token), await digest(expectedToken));
}

export async function sha256Hex(value: string): Promise<string> {
	const bytes = await digest(value);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
