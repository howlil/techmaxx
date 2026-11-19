import type { ReactNode } from "react";
import Badge from "../arc/badge/badge";
import styles from "./FixtureNotice.module.css";

interface FixtureNoticeProps {
	children: ReactNode;
	trailing?: ReactNode;
}

export function FixtureNotice({ children, trailing }: FixtureNoticeProps) {
	return (
		<aside className={styles.root} role="note">
			<Badge size="sm" tone="neutral" dot>
				Data contoh
			</Badge>
			<p>{children}</p>
			{trailing ? <div className={styles.trailing}>{trailing}</div> : null}
		</aside>
	);
}
