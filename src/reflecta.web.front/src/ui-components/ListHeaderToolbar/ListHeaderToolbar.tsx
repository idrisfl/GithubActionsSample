import { NJCheckbox, NJIconButton } from "@engie-group/fluid-design-system-react";
import styles from "./ListHeaderToolbar.module.css";
import { useEffect, useRef, useState } from "react";
export interface IListHeaderToolbarProps {
    sortOrder: 'asc' | 'desc' | undefined;
    onToggleSortOrder: () => void;
    onFilterChange?: (values: string[]) => void;
    filterValues?: { value: string, label: string }[];
    filterField?: string;
}
function renderSortIcon(sortOrder: 'asc' | 'desc' | undefined, onToggleSortOrder: () => void) {
    switch (sortOrder) {
        case 'asc':
            return <NJIconButton icon="arrow_drop_up" label={""} onClick={onToggleSortOrder} />;
        case 'desc':
            return <NJIconButton icon="arrow_drop_down" label={""} onClick={onToggleSortOrder} />;
        default:
            return <NJIconButton icon="unfold_more" label={""} onClick={onToggleSortOrder} />;
    }
}
export const ListHeaderToolbar: React.FC<IListHeaderToolbarProps> = ({ sortOrder, onToggleSortOrder, onFilterChange, filterValues: defaultFilterValues, filterField }) => {
    const [showFilter, setShowFilter] = useState(false);
    const [filterContainerPosition, setFilterContainerPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
    const [filterValues, setFilterValues] = useState<{ value: string; label: string; selected?: boolean }[]>(defaultFilterValues!);
    const [domRect, setDomRect] = useState<DOMRect>();
    const [filterString, setFilterString] = useState<string>('');

    const filterButtonRef = useRef<HTMLButtonElement>();
    const filterContainerRef = useRef<HTMLDivElement | undefined>();
    useEffect(() => {
        if (!domRect) {
            setDomRect(filterButtonRef.current?.getBoundingClientRect());
            return;
        }
        setFilterContainerPosition({ top: (domRect?.y! - 24) || 0, left: domRect?.x || 0 });
    }, [filterButtonRef, domRect]);
    useEffect(() => {
        document.addEventListener('click', (e) => {
            if (
                filterContainerRef.current?.contains(e.target as any) ||
                filterButtonRef.current?.parentElement?.contains(e.target as any)
            ) {
                return;
            }
            setShowFilter(false);
        });
        window.addEventListener('resize', () => {
            setShowFilter(false);
            setDomRect(filterButtonRef.current?.getBoundingClientRect());
        });
    }, []);
    const handleFiltersChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newFilterValues = [...filterValues];
        newFilterValues[index].selected = e.target.checked;
        setFilterValues(newFilterValues);
        onFilterChange!(newFilterValues.filter(v => v.selected).map(v => v.value));
    };
    const handleAllFiltersChange = (newValue?: boolean) => {
        const newFilterValues = [...filterValues];
        newFilterValues.forEach(v => v.selected = newValue);
        setFilterValues(newFilterValues);
        onFilterChange!(newFilterValues.filter(v => v.selected).map(v => v.value));
    };
    return (
        <div className={styles.container}>
            {
                renderSortIcon(sortOrder, onToggleSortOrder)
            }
            <NJIconButton icon="filter_alt" label={""} onClick={() => { setShowFilter(!showFilter); }}
                ref={filterButtonRef as any} variant={!filterValues || filterValues?.every(v => v.selected) || filterValues?.every(v => !v.selected) ? 'primary' : 'brand'} />
            {
                showFilter && filterValues &&
                <div className={styles.filterContainer}
                    style={{ position: 'absolute', ...filterContainerPosition }} ref={filterContainerRef as any}>
                    <div className={styles.filterHeader}>
                        <div>
                            <NJIconButton icon="remove_done" label={""} onClick={() => {
                                setFilterValues(filterValues.map(v => ({ ...v, selected: false })));
                                handleAllFiltersChange(false);
                            }}
                                isDisabled={filterValues.every(v => !v.selected)}
                            />
                            <NJIconButton icon="done_all" label={""} onClick={() => {
                                setFilterValues(filterValues.map(v => ({ ...v, selected: false })));
                                handleAllFiltersChange(true);
                            }}
                                isDisabled={filterValues.every(v => v.selected)}
                            />
                        </div>
                        <div>
                            <input type="text" placeholder="Filter..." className={styles.filterInput} onChange={(e) => setFilterString(e.target.value)} value={filterString} />
                            {
                                filterString && <NJIconButton icon="cancel" label={""} onClick={(e) => { setFilterString(''); e.stopPropagation(); }} />
                            }
                        </div>
                    </div>
                    <div className={styles.filterValuesWrapper}>
                        <div className={styles.filterValues}>
                            {
                                filterValues.map((filterValue, index) => ({ ...filterValue, index })).filter(filterValue => filterValue.label.toLowerCase().includes(filterString.toLowerCase())).map((filterValue) =>
                                    <NJCheckbox key={filterValue.index} label={filterValue.label} isChecked={filterValue.selected}
                                        onChange={(e) => handleFiltersChange(e,filterValue.index)} inputId={`${filterField}-${filterValue.index}`}
                                        value={filterValue.value} />
                                )
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
};