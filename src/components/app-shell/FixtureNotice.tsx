import type { ReactNode } from "react";
import Badge from "../arc/badge/badge";
import styles from "./FixtureNotice.module.css";

interface FixtureNoticeProps {
	children: ReactNode;
	trailing?: ReactNode;
	label?: string;
}

export function FixtureNotice({ children, trailing, label = "Data contoh" }: FixtureNoticeProps) {
	return (
		<aside className={styles.root} role="note">
			<Badge size="sm" tone="neutral" dot>
				{label}
			</Badge>
			<p>{children}</p>
			{trailing ? <div className={styles.trailing}>{trailing}</div> : null}
		</aside>
	);
}
