
import styles from './ReportPage.module.css';
import { Await, useLoaderData, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { ErrorComponent } from '../../ui-components/ErrorComponent/ErrorComponent';
import { ReportSkeleton } from './ReportPageSkeleton';
import { IReport } from '../../model';
import { useLayoutContext } from '../../LayoutContext';
import disclaimer from '../../../public/disclaimer.json';
import Markdown from 'react-markdown';
import { NJFab, NJFabMenu, NJIconButton, NJInlineMessage, NJList, NJListItem, NJTab, NJTabs } from '@engie-group/fluid-design-system-react';
import moment from 'moment';
import { DeleteModal } from '../../ui-components/DeleteModal/DeleteModal';

function transformCompletion(systemCompletion: string): string | null | undefined {
    return systemCompletion?.replace(/(?:(\s)|_)(\d+)(?:(,)|_)/g, `$1[$2](${import.meta.env.VITE_INCIDENT_URL_FORMAT.replace('{id}', '$2')})$3`);
}

export const ReportPage: React.FC<{}> = () => {
    const { report } = useLoaderData() as { report: Promise<IReport> };
    const { setPageTitle, setIsNavFolded } = useLayoutContext();
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    return (
        <React.Suspense
            fallback={<ReportSkeleton />}
        >
            <Await
                resolve={report}
                errorElement={<ErrorComponent />}
            >
                {
                    (report: IReport) => {
                        useEffect(() => {
                            setPageTitle && setPageTitle(`Report: ${report.title}`);
                        }, [report]);
                        useEffect(() => {
                            setIsNavFolded && setIsNavFolded(true);
                        }, []);
                        const formattedIncidentTimeframeFrom = report.filters?.incidentTimeFrame?.from ? `Starting from **${moment(report.filters?.incidentTimeFrame?.from).format('DD MMM YYYY')}**` : '';
                        const formattedIncidentTimeframeTo = report.filters?.incidentTimeFrame?.to ? `${formattedIncidentTimeframeFrom != '' ? 'until' : 'Until'} **${report.filters?.incidentTimeFrame?.to ? moment(report.filters?.incidentTimeFrame?.to).format('DD MMM YYYY') : ''}**` : '';

                        return (
                            <div className={styles.wrapper}>
                                <div className={styles.container}>
                                    <div className={`${styles.row} ${styles.disclaimer}`}>
                                        {disclaimer.value}
                                    </div>
                                    <div className={`${styles.row} ${styles.headerWrapper}`}>
                                        <span className={styles.header}>Question</span>
                                    </div>
                                    <div className={`${styles.row} ${styles.contentWrapper}`}>
                                        <Markdown className={styles.content}>{report.query}</Markdown>
                                        <NJIconButton className={styles.noPrint} icon="content_copy" onClick={() => { navigator.clipboard.writeText(report.query); }} label={''} />
                                    </div>
                                    <div className={`${styles.row} ${styles.headerWrapper}`}>
                                        <span className={styles.header}>Filters</span>
                                    </div>
                                    <div className={`${styles.row} ${styles.contentWrapper}`}>
                                        <div className={styles.filterTable}>
                                            {report.filters?.incidentTimeFrame &&
                                                <div className={styles.filterRow}>
                                                    <div className={styles.filterCell}>Timeframe</div>
                                                    <div className={styles.filterCell}><Markdown>{`${formattedIncidentTimeframeFrom} ${formattedIncidentTimeframeTo}`}</Markdown></div>
                                                </div>
                                            }
                                            {report.filters?.gbus && report.filters?.gbus.length > 0 &&
                                                <div className={styles.filterRow}>
                                                    <div className={styles.filterCell}>GBUs</div>
                                                    <div className={styles.filterCell}>{report.filters?.gbus?.join(', ')}</div>
                                                </div>
                                            }
                                            {report.filters?.lifeSavingRules && report.filters?.lifeSavingRules.length > 0 &&
                                                <div className={styles.filterRow}>
                                                    <div className={styles.filterCell}>Life-saving Rules</div>
                                                    <div className={styles.filterCell}>{report.filters?.lifeSavingRules?.join(', ')}</div>
                                                </div>
                                            }
                                            <div className={styles.filterRow}>
                                                <div className={styles.filterCell}>Only HIPO</div>
                                                <div className={styles.filterCell}>{report.filters?.onlyHipo ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${styles.row} ${styles.headerWrapper} ${styles.printOnly}`}>
                                        <span className={styles.header}>AI-Generated Response</span>
                                    </div>
                                    {report.status === 'success' &&
                                        <NJTabs
                                            activeTab="responsePanel"
                                            label=""
                                        >
                                            <NJTab
                                                ariaControls="panel1"
                                                id="responsePanel"
                                                label="AI-Generated Response"
                                            >
                                                <div className={styles.tabContent}>
                                                    <div className={`${styles.row} ${styles.contentWrapper}`}>
                                                        <Markdown className={styles.content}>{transformCompletion(report.systemCompletion)}</Markdown>
                                                        <NJIconButton className={styles.noPrint} icon="content_copy" onClick={() => { navigator.clipboard.writeText(report.systemCompletion); }} label={''} />
                                                    </div>
                                                </div>
                                            </NJTab>
                                            <NJTab
                                                ariaControls="panel2"
                                                id="tab-separator"
                                                label=""
                                                isDisabled
                                            >
                                            </NJTab>
                                            <NJTab
                                                ariaControls="panel3"
                                                id="incidentPanel"
                                                label={`Related Incidents (${report.relatedIncidents?.length || 0})`}
                                            >
                                                <NJList>
                                                    <div className={styles.tabContentRI}>
                                                        {
                                                            report.relatedIncidents?.map(incident => {
                                                                return (
                                                                    <NJListItem
                                                                        key={incident.id}
                                                                        title={incident.title!}
                                                                        type='link'
                                                                        noActiveBorder={true}
                                                                        target='_blank'
                                                                        href={import.meta.env.VITE_INCIDENT_URL_FORMAT.replace('{id}', `${incident.id}`)}
                                                                    >{`${incident.id} - ${incident.title}`}</NJListItem>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </NJList>
                                            </NJTab>
                                            <NJTab
                                                ariaControls="panel4"
                                                id="techPanel"
                                                label="Technical Details"
                                            >
                                                <div className={styles.techTabContent}>
                                                    <div className={styles.row}>
                                                        <label htmlFor="cost" className={styles.label}>Cost:</label>
                                                        <div className={styles.col}>
                                                            <span>{Math.round(report.runCosts?.totalCost*100)/100}€</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.row}>
                                                        <label htmlFor="cost" className={styles.label}>Run time:</label>
                                                        <div className={styles.col}>
                                                            <span>{moment.duration(report.runTimeSeconds, 'seconds').humanize()}</span>
                                                        </div>
                                                    </div>
                                                    <label>Criteria:</label>
                                                    <div className={styles.contentWrapper}>
                                                        <Markdown>{report.criteria}</Markdown>
                                                    </div>
                                                    <label >oxDotMap:</label>
                                                    <div className={`${styles.contentWrapper} ${styles.oxdot}`}>
                                                        {report.oxDotMap}
                                                    </div>
                                                </div>
                                            </NJTab>
                                        </NJTabs>
                                    }
                                    {report.status === 'error' &&
                                        <NJInlineMessage onClose={function noRefCheck() { }}>
                                            <span data-child-name="njInlineMessageTitle">
                                                Error generating report
                                            </span>
                                            <div>
                                                Generation of this report failed with the following error: {report.errorDetails || 'An unknown error has occurred'}
                                            </div>
                                        </NJInlineMessage>
                                    }
                                    {report.status === 'warning' &&
                                        <NJInlineMessage onClose={function noRefCheck() { }} variant='warning'>
                                            <span data-child-name="njInlineMessageTitle">
                                                Error generating report
                                            </span>
                                            <div>
                                                Generation of this report failed with the following issue: {report.errorDetails || 'An unknown error has occurred'}
                                            </div>
                                        </NJInlineMessage>
                                    }
                                </div>
                                <NJFabMenu
                                    dataPlacement="top"
                                    label={''}
                                    className={`${styles.fab} ${styles.noPrint}`}>
                                    <NJFab
                                        icon="copy_all"
                                        label="Copy query"
                                        size="sm"
                                        variant="default"
                                        onClick={() => { navigate(`/report`, { state: { copy: report } }); }}
                                    />
                                    <NJFab
                                        icon="print"
                                        label="Print report"
                                        size="sm"
                                        variant="default"
                                        onClick={() => { window.print(); }}
                                    />
                                    <NJFab
                                        icon="delete"
                                        label="Delete report"
                                        size="sm"
                                        variant="light"
                                        onClick={() => { setShowDeleteModal(true) }}
                                    />
                                    <DeleteModal onClose={() => { setShowDeleteModal(false) }}
                                        key={`${report.queryId}`}
                                        isOpen={showDeleteModal}
                                        reportId={report.queryId}
                                        title={report.title} onDelete={(err) => { if (!err) { navigate('/reports') } }} />
                                </NJFabMenu>
                            </div>
                        );
                    }
                }
            </Await>
        </React.Suspense>
    )
};