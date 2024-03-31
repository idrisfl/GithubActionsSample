
import { NJButton, NJCheckbox, NJFormItem, NJIconButton, NJListItem, NJMultiSelect, NJSpinner } from '@engie-group/fluid-design-system-react';
import styles from './ReportsNew.module.css';
import { Await, Form, useLoaderData, useLocation, useSubmit } from 'react-router-dom';
import { ILifeSavingRule, IReport, IReportRequest } from '../../model';
import React, { useEffect, useState } from 'react';
import { ErrorComponent } from '../../ui-components/ErrorComponent/ErrorComponent';
import { ReportsNewSkeleton } from './ReportsNewSkeleton';
import { getTitleSuggestion } from '../../utils/restApiCalls';
// import { FavoritesModal } from '../../ui-components/FavoritesModal/FavoritesModal';
import { useLayoutContext } from '../../LayoutContext';
import moment from 'moment';

export const ReportsNew: React.FC<{}> = () => {
    const data = useLoaderData() as { formValues: [string[], ILifeSavingRule[]] };
    const { state } = useLocation() as { state: { default?: IReportRequest } };
    const defaultValues = {
        ...state?.default,
        incidentTimeFrame: state?.default?.incidentTimeFrame || { from: moment(new Date()).add(-1, 'month').toDate(), to: new Date() }
    } as IReportRequest;
    const [request, setRequest] = useState<IReportRequest>(defaultValues);
    const [fieldErrors, setFieldErrors] = useState<{ [field in keyof (IReportRequest & { maxOccurenceDate: Date; minOccurenceDate: Date })]: string }>({ title: '', prompt: '', gbus: '', lifeSavingRules: '', incidentTimeFrame: '', createdBy: '', maxOccurenceDate: '', minOccurenceDate: '' });
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    // const [isFavModalOpen, setIsFavModalOpen] = useState(false);
    const submit = useSubmit();

    const handleFieldChange = (field: keyof (IReportRequest & { maxOccurenceDate: Date; minOccurenceDate: Date }), value: any) => {
        let processedValue = value;
        switch (field) {
            case 'gbus':
                // if(!value || value.length === 0){
                //     processedValue = ['All GBUs'];
                // }else{
                //     processedValue = (value as string[]).filter((v) => v !== 'All GBUs');
                // }
                setRequest({ ...request, [field]: processedValue });
                break;
            case 'maxOccurenceDate':
                processedValue = value ? new Date(value) : null;
                setRequest({ ...request, incidentTimeFrame: { ...request.incidentTimeFrame, to: processedValue } });
                break;
            case 'minOccurenceDate':
                processedValue = value ? new Date(value) : null;
                setRequest({ ...request, incidentTimeFrame: { ...request.incidentTimeFrame, from: processedValue } });
                break;
            default:
                setRequest({ ...request, [field]: processedValue });
        }
    };

    const handleFieldValidation = (field: keyof (IReportRequest & { maxOccurenceDate: Date; minOccurenceDate: Date }), value: any) => {
        switch (field) {
            case 'title':
            case 'prompt':
                if (value === '') {
                    setFieldErrors({ ...fieldErrors, [field]: 'This field is required' });
                } else {
                    setFieldErrors({ ...fieldErrors, [field]: '' });
                }
                break;
            case 'minOccurenceDate':
                if (value && isNaN(Date.parse(value))) {
                    setFieldErrors({ ...fieldErrors, [field]: 'Invalid date' });
                } else {
                    if (request?.incidentTimeFrame?.to && new Date(value) > request?.incidentTimeFrame?.to) {
                        setFieldErrors({ ...fieldErrors, [field]: 'From date cannot be greater than To date' });
                    } else {
                        if (new Date(value) > new Date()) {
                            setFieldErrors({ ...fieldErrors, [field]: 'From date cannot be greater than today' });
                        } else {
                            setFieldErrors({ ...fieldErrors, [field]: '' });
                        }
                    }
                }
                break;
            case 'maxOccurenceDate':
                if (value && isNaN(Date.parse(value))) {
                    setFieldErrors({ ...fieldErrors, [field]: 'Invalid date' });
                } else {
                    if (request?.incidentTimeFrame?.from && new Date(value) < request?.incidentTimeFrame?.from) {
                        setFieldErrors({ ...fieldErrors, [field]: 'To date cannot be less than From date' });
                    } else {
                        if (new Date(value) > new Date()) {
                            setFieldErrors({ ...fieldErrors, [field]: 'To date cannot be greater than today' });
                        } else {
                            setFieldErrors({ ...fieldErrors, [field]: '' });
                        }
                    }
                }
                break;
        }
    };
    const name = 'Authenticated user name';
    const { setPageTitle } = useLayoutContext();
    useEffect(() => {
        setPageTitle && setPageTitle('New Report');
    }, [setPageTitle]);

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.copy) {
            const reportToCopy = location.state.copy as IReport;
            setRequest({
                title: reportToCopy.title,
                prompt: reportToCopy.query,
                gbus: reportToCopy.filters.gbus,
                lifeSavingRules: reportToCopy.filters.lifeSavingRules,
                onlyHipo: reportToCopy.filters.onlyHipo,
                incidentTimeFrame: {
                    from: new Date(reportToCopy.filters.incidentTimeFrame.from),
                    to: new Date(reportToCopy.filters.incidentTimeFrame.to)
                },
                createdBy: ''
            });
        }
    }, [location.state]);

    return (
        <React.Suspense
            fallback={<ReportsNewSkeleton />}
        >
            <Await
                resolve={data.formValues}
                errorElement={<ErrorComponent />}
            >
                {(formValues: [string[], ILifeSavingRule[]]) => (
                    <>
                        <div className={styles.wrapper}>
                            <Form className={styles.form} action='/report' method='POST'>
                                <div className={styles.row}>
                                    <div className={styles.splitRow}>
                                        <div className={styles.row}>
                                            <NJFormItem
                                                value={request?.title}
                                                className={styles.formItem}
                                                label="Title"
                                                name="title"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldValidation('title', e.target.value)}
                                                type="text"
                                                hasError={fieldErrors.title !== ''}
                                                subscriptMessage={fieldErrors.title}
                                                id="title" isRequired
                                                isDisabled={isSuggestionLoading}
                                            />
                                            {!isSuggestionLoading && <NJIconButton
                                                icon="auto_fix_high"
                                                label="Suggest"
                                                type='button'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsSuggestionLoading(true);
                                                    getTitleSuggestion(request)
                                                        .then((suggestion) => {
                                                            setRequest({ ...request, title: suggestion });
                                                            setIsSuggestionLoading(false);
                                                        })
                                                        .catch((err) => {
                                                            setIsSuggestionLoading(false);
                                                            throw new Error(err);
                                                        });
                                                }}
                                                size='large'
                                                variant='brand'
                                                className={styles.sameRowMarginTop}
                                            />}
                                            <NJSpinner isLoading={isSuggestionLoading} size='sm' className={styles.sameRowMarginTop} />
                                        </div>
                                        {/* <NJButton onClick={() => { setIsFavModalOpen(true); }} className={styles.favButton} type='button'>
                                        <NJIcon name='bookmark' data-child-name="customIcon" className={styles.favButtonIcon} />
                                        <span data-child-name="customLabel">
                                            From my favorites
                                        </span>
                                    </NJButton> */}
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <NJFormItem
                                        className={styles.formItem}
                                        value={moment(request?.incidentTimeFrame?.from).format('YYYY-MM-DD')}
                                        label="Start"
                                        name="from"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('minOccurenceDate', e.target.value)}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldValidation('minOccurenceDate', e.target.value)}
                                        hasError={fieldErrors.minOccurenceDate !== ''}
                                        subscriptMessage={fieldErrors.minOccurenceDate}
                                        type="date"
                                        id="from" />
                                    <NJFormItem
                                        value={moment(request?.incidentTimeFrame?.to).format('YYYY-MM-DD')}
                                        className={styles.formItem}
                                        label="End"
                                        name="to"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('maxOccurenceDate', e.target.value)}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldValidation('maxOccurenceDate', e.target.value)}
                                        hasError={fieldErrors.maxOccurenceDate !== ''}
                                        subscriptMessage={fieldErrors.maxOccurenceDate}
                                        type="date"
                                        id="to" />
                                </div>
                                <div className={styles.row}>
                                    <div className={`${styles.formItem} ${styles.col2}`}>
                                        <NJMultiSelect
                                            className={`${styles.multiSelect} ${styles.formItem}`}
                                            buttonDefaultValueLabel="Select a value"
                                            id="gbus"
                                            label={`${request?.gbus?.length ? 'GBU(s)' : 'All GBUs'}`}
                                            value={request?.gbus}
                                            listNavigationLabel="Use up and down arrows and Enter to select a value"
                                            onChange={(e) => {
                                                handleFieldChange('gbus', e);
                                                handleFieldValidation('gbus', e);
                                            }}
                                            hasError={fieldErrors.gbus !== ''}
                                            subscriptMessage={fieldErrors.gbus}
                                        >

                                            {formValues[0].map((gbu, i) => (
                                                <NJListItem value={`${gbu}`} key={`gbu-${i}`}>
                                                    {gbu}
                                                </NJListItem>
                                            ))}
                                        </NJMultiSelect>
                                    </div>
                                    <div className={`${styles.formItem} ${styles.col2} ${styles.padding8}`}>
                                        <NJCheckbox
                                            label="Only HIPO"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('onlyHipo', e.target.checked)}
                                            inputId='hipo' isChecked={request?.onlyHipo} value='' />
                                    </div>
                                </div>
                                <div className={styles.row}>
                                    <NJMultiSelect
                                        className={`${styles.multiSelect} ${styles.formItem}`}
                                        buttonDefaultValueLabel="Select a value"
                                        id="lsr"
                                        label={`${request?.lifeSavingRules?.length ? 'Life Saving Rule(s)' : 'All Life Saving Rules'}`}
                                        listNavigationLabel="Use up and down arrows and Enter to select a value"
                                        value={request?.lifeSavingRules}
                                        onChange={(e) => {
                                            handleFieldChange('lifeSavingRules', e);
                                            handleFieldValidation('lifeSavingRules', e);
                                        }
                                        }
                                        hasError={fieldErrors.lifeSavingRules !== ''}
                                        subscriptMessage={fieldErrors.lifeSavingRules}
                                    >
                                        {formValues[1]?.map((lsr) => (
                                            <NJListItem value={`${lsr.id}`} key={`lfr-${lsr.id}`}>
                                                {lsr.title}
                                            </NJListItem>
                                        ))}
                                    </NJMultiSelect>
                                </div>
                                <div className={`${styles.row} ${styles.promptRow}`}>
                                    <NJFormItem
                                        className={styles.formItem}
                                        label="Prompt"
                                        name="prompt"
                                        rows={5}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('prompt', e.target.value)}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => handleFieldValidation('prompt', e.target.value)}
                                        hasError={fieldErrors.prompt !== ''}
                                        subscriptMessage={fieldErrors.prompt}
                                        value={request?.prompt}
                                        type="text"
                                        id="prompt" isMultiline isRequired />
                                </div>
                                <div className={`${styles.row} ${styles.reverse}`}>
                                    <NJButton
                                        className={styles.submitButton}
                                        isDisabled={Object.values(fieldErrors).some((v) => v !== '')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData();
                                            formData.append('title', JSON.stringify(request.title));
                                            formData.append('createdBy', JSON.stringify(name));
                                            formData.append('prompt', JSON.stringify(request.prompt));
                                            formData.append('gbus', JSON.stringify(request.gbus));
                                            formData.append('lifeSavingRules', JSON.stringify(request.lifeSavingRules));
                                            formData.append('onlyHipo', JSON.stringify(request.onlyHipo));
                                            formData.append('incidentTimeFrame', JSON.stringify(request.incidentTimeFrame));
                                            submit(formData, { method: 'POST', action: '/report' });
                                        }}
                                        label='Generate'>
                                    </NJButton>
                                </div>
                            </Form>
                        </div>
                        {/* <FavoritesModal key={isFavModalOpen + ''} isOpen={isFavModalOpen}
                            onRequestSelected={(selection) => {
                                setRequest({ ...request, ...selection });
                                setIsFavModalOpen(false);
                            }}
                            onClose={() => { setIsFavModalOpen(false) }}
                        /> */}
                    </>
                )
                }
            </Await>
        </React.Suspense>
    )
};