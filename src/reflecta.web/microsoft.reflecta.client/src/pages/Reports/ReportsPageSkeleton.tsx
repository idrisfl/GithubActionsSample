
import { NJSkeletonRectangle } from '@engie-group/fluid-design-system-react';
import styles from './ReportsPage.module.css';

export function ReportsSkeleton() {
    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <NJSkeletonRectangle width='145px' height='24px' />
                </div>
                <div className={styles.table}>
                    <div className={`${styles.header} ${styles.row}`}>
                        <div className={styles.col1}>
                            <div className={styles.cellWrapper}>
                                <span>&nbsp;</span>
                            </div>
                        </div>
                        <div className={styles.col2}>
                            <div className={styles.cellWrapper}>
                                <span>Title</span>
                            </div>
                        </div>
                        <div className={styles.col3}>
                            <div className={styles.cellWrapper}>
                                <span>Date</span>
                            </div>
                        </div>
                        <div className={styles.col4}>
                            <div className={styles.cellWrapper}>
                                <span>Created by</span>
                            </div>
                        </div>
                        <div className={styles.col5}>
                            <div className={styles.cellWrapper}>
                                <span>&nbsp;</span>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.row} ${styles.reportRow}`}>
                        <div className={styles.col1}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col2}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />

                            </div>
                        </div>
                        <div className={styles.col3}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col4}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col5}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.row} ${styles.reportRow}`}>
                        <div className={styles.col1}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col2}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col3}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col4}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                        <div className={styles.col5}>
                            <div className={styles.cellWrapper}>
                                <NJSkeletonRectangle height='36px' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
