import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
	eyebrow: string;
	title: string;
	description: string;
	aside?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, aside }: SectionHeadingProps) {
	return (
		<header className={styles.root}>
			<div className={styles.copy}>
				<p className={styles.eyebrow}>
					<span aria-hidden="true" />
					{eyebrow}
				</p>
				<h1>{title}</h1>
				<p className={styles.description}>{description}</p>
			</div>
			{aside ? <div className={styles.aside}>{aside}</div> : null}
		</header>
	);
}
