
import styles from './ReportsPage.module.css';
import React, { useCallback, useEffect, useState } from 'react';
import { ReportsSkeleton } from './ReportsPageSkeleton';
import { Await, useLoaderData, useNavigate } from 'react-router-dom';
import { ErrorComponent } from '../../ui-components/ErrorComponent/ErrorComponent';
import { IReport } from '../../model';
import { NJButton, NJIconButton, NJLink } from '@engie-group/fluid-design-system-react';
import { ListHeaderToolbar } from '../../ui-components/ListHeaderToolbar/ListHeaderToolbar';
import moment from 'moment';
import { ReportStatus } from '../../ui-components/ReportStatus/ReportStatus';
import { useLayoutContext } from '../../LayoutContext';
import { getReports } from '../../utils/restApiCalls';
import { DeleteModal } from '../../ui-components/DeleteModal/DeleteModal';

function getFilterValues(reports: IReport[], field: keyof IReport) {
    switch (field) {
        case 'status':
            let filterValues = reports.map(r => {
                return {
                    label: (r[field] || '').split(' ').map(s => `${s.substring(0, 1).toUpperCase()}${s.substring(1)}`).join(' '),
                    value: r[field] || ''
                }
            });
            filterValues = [...new Set(filterValues.map(v => v.value))].map(v => filterValues.find(sv => sv.value == v)!);
            return filterValues;
        case 'title':
        case 'createdBy':
            const textValues = reports.map(r => {
                return {
                    label: r[field] || '',
                    value: r[field] || ''
                }
            });
            return textValues.filter((v, i, a) => a.findIndex(av => av.label == v.label) == i);
        case 'createdDate':
            const dateValues = reports.map(r => {
                return {
                    label: r[field] ? moment(r[field]).format('yyyy-MM-DD') : '',
                    value: r[field]
                }
            });
            return dateValues.filter((v, i, a) => a.findIndex(av => av.label == v.label) == i);
    }

}
export const ReportsPage: React.FC<{}> = () => {
    const { reports: reportsPromise } = useLoaderData() as { reports: IReport[] };
    const [sort, setSort] = React.useState<{ field: 'status' | 'title' | 'createdDate' | 'createdBy'; order: 'asc' | 'desc' }>({ field: 'createdDate', order: 'desc' });
    const toggleSortOrder = (field: 'status' | 'title' | 'createdDate' | 'createdBy') => {
        if (sort?.field == field) {
            setSort({ field, order: sort.order == 'asc' ? 'desc' : 'asc' });
        } else {
            setSort({ field, order: 'asc' });
        }
    };
    // const isFavorite = (_: string) => {
    //     return false;
    // }
    const [filters, setFilters] = useState<{ values: any[], field: keyof IReport }[]>([]);
    const [filteredReports, setFilteredReports] = useState<IReport[]>();
    const [refreshedReports, setRefreshedReports] = useState<IReport[]>();
    const { setPageTitle } = useLayoutContext();
    React.useEffect(() => {
        setPageTitle && setPageTitle('Reports');
    }, [setPageTitle]);
    const navigate = useNavigate();
    const reloadReports = useCallback(async () => {
        setRefreshedReports(await getReports());
    }, [setRefreshedReports]);
    useEffect(() => {
        const intervalId = setInterval(async () => {
            reloadReports();
        }, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);
    const [showDeleteModal, setShowDeleteModal] = useState<{ [key: string]: boolean }>({});

    return (
        <React.Suspense
            fallback={<ReportsSkeleton />}
        >
            <Await
                resolve={reportsPromise}
                errorElement={<ErrorComponent />}
            >
                {(initialReports: IReport[]) => {
                    const reports = refreshedReports || initialReports;
                    const effectiveReports = filteredReports || reports;
                    const sortedReports = !sort?.order ? effectiveReports : effectiveReports.sort((a, b) => {
                        const valA = a[sort.field];
                        const valB = b[sort.field];
                        if (sort.order == 'asc') {
                            return valA! > valB! ? 1 : -1;
                        } else {
                            return valA! < valB! ? 1 : -1;
                        }
                    });
                    const statusFilterValues = getFilterValues(effectiveReports, 'status');
                    const titleFilterValues = getFilterValues(effectiveReports, 'title');
                    const createdDateFilterValues = getFilterValues(effectiveReports, 'createdDate');
                    const createdByFilterValues = getFilterValues(effectiveReports, 'createdBy');

                    const handleFilterChange = (field: keyof IReport, values: string[]) => {
                        const newFilters = [...filters.filter(f => f.field != field), { field, values }];
                        const newFilteredReports = newFilters.length > 0 ? reports.filter(r => {
                            return newFilters.every(f => {
                                return f.values.length == 0 || f.values.includes(r[f.field]);
                            });
                        }) : effectiveReports;
                        setFilters(newFilters);
                        setFilteredReports(newFilteredReports);
                    }

                    return (
                        <>
                            <div className={styles.outerContainer}>
                                <div className={styles.marginTop} />
                                <div className={styles.wrapper}>
                                    <div className={styles.container}>
                                        <div className={styles.top}>
                                            <NJButton
                                                icon='refresh'
                                                label='Refresh'
                                                size='normal'
                                                variant='secondary'
                                                onClick={() => reloadReports()} />
                                        </div>
                                            <div className={styles.table}>
                                                <div className={`${styles.header} ${styles.row}`}>
                                                    <div className={styles.col1}>
                                                        <div className={styles.cellWrapper}>
                                                            <span>&nbsp;</span>
                                                            <ListHeaderToolbar
                                                                sortOrder={sort?.field == 'status' ? sort.order : undefined}
                                                                onToggleSortOrder={() => toggleSortOrder('status')}
                                                                filterValues={statusFilterValues}
                                                                onFilterChange={values => handleFilterChange('status', values)} filterField='status' />
                                                        </div>
                                                    </div>
                                                    <div className={styles.col2}>
                                                        <div className={styles.cellWrapper}>
                                                            <span>Title</span>
                                                            <ListHeaderToolbar
                                                                sortOrder={sort?.field == 'title' ? sort.order : undefined}
                                                                onToggleSortOrder={() => toggleSortOrder('title')}
                                                                filterValues={titleFilterValues}
                                                                onFilterChange={values => handleFilterChange('title', values)}
                                                                filterField='title'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.col3}>
                                                        <div className={styles.cellWrapper}>
                                                            <span>Date</span>
                                                            <ListHeaderToolbar
                                                                sortOrder={sort?.field == 'createdDate' ? sort.order : undefined}
                                                                onToggleSortOrder={() => toggleSortOrder('createdDate')}
                                                                filterValues={createdDateFilterValues}
                                                                onFilterChange={values => handleFilterChange('createdDate', values)}
                                                                filterField='createdDate'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.col4}>
                                                        <div className={styles.cellWrapper}>
                                                            <span>Created by</span>
                                                            <ListHeaderToolbar
                                                                sortOrder={sort?.field == 'createdBy' ? sort.order : undefined}
                                                                onToggleSortOrder={() => toggleSortOrder('createdBy')}
                                                                filterValues={createdByFilterValues}
                                                                onFilterChange={values => handleFilterChange('createdBy', values)}
                                                                filterField='createdBy'
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className={styles.col5}>
                                                        <div className={styles.cellWrapper}>
                                                            <span>&nbsp;</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <div className={styles.tableWrapper}>
                                            <div className={styles.table}>
                                                {sortedReports.length === 0 && <div className={styles.noData}>No data available</div>}
                                                {
                                                    sortedReports.map((report, index) =>
                                                        <div key={index} className={`${styles.row} ${styles.reportRow}`}>
                                                            <div className={styles.col1}>
                                                                <div className={styles.cellWrapper}>
                                                                    <ReportStatus report={report} />
                                                                </div>
                                                            </div>
                                                            <div className={styles.col2}>
                                                                <div className={styles.cellWrapper}>
                                                                    {report.status == 'success' ?
                                                                        <NJLink
                                                                            href={`/report/${report.queryId}`}
                                                                            target='_blank'
                                                                            size='md'
                                                                            isExternal={false}
                                                                            title={report.title}
                                                                        >
                                                                            {report.title}
                                                                        </NJLink> :
                                                                        <label>{report.title}</label>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className={styles.col3}>
                                                                <div className={styles.cellWrapper}>
                                                                    {report.createdDate ? moment(report.createdDate).fromNow() : ''}
                                                                </div>
                                                            </div>
                                                            <div className={styles.col4}>
                                                                <div className={styles.cellWrapper}>
                                                                    {report.createdBy}
                                                                </div>
                                                            </div>
                                                            <div className={styles.col5}>
                                                                <div className={styles.cellWrapper}>
                                                                    {/* <NJIconButton
                                                            icon={isFavorite(report.queryId) ? 'bookmark' : 'bookmark_border'}
                                                            label={''} variant='brand' size='large' /> */}
                                                                    <NJIconButton
                                                                        icon='copy_all'
                                                                        label={''} variant='brand' size='large'
                                                                        onClick={() => navigate('/report', { state: { copy: report } })}
                                                                    />
                                                                    <NJIconButton
                                                                        icon='delete'
                                                                        label={''} variant='destructive' size='large'
                                                                        onClick={() => { setShowDeleteModal({ ...showDeleteModal, [report.queryId]: true }) }}
                                                                    />
                                                                    <DeleteModal onClose={() => { setShowDeleteModal({ ...showDeleteModal, [report.queryId]: false }) }}
                                                                        key={`${report.queryId}`}
                                                                        isOpen={showDeleteModal[report.queryId]}
                                                                        reportId={report.queryId}
                                                                        title={report.title} onDelete={(err) => { if (!err) { reloadReports(); } }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.marginTop} />
                            </div>
                        </>
                    )
                }
                }
            </Await>
        </React.Suspense >
    )
};