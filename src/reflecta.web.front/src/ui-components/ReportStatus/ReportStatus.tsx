import { NJIcon, NJTooltip } from "@engie-group/fluid-design-system-react";
import { IReport } from "../../model";

export const ReportStatus: React.FC<{ report: IReport }> = ({ report }) => {
    const uuid = (new Date()).getTime().toString();
    return (
        <div>
            {report.status === 'success' &&
                <NJTooltip key={uuid} text="✅: This report was successfully generated and ready to view">
                    <NJIcon name="check_circle" variant='green' />
                </NJTooltip>
            }
            {report.status === 'error' &&
                <NJTooltip key={uuid} text={`❌: ${report.errorDetails || 'An unknown error has occurred'}`}>
                    <NJIcon name="error" variant='red' />
                </NJTooltip>
            }
            {report.status === 'in progress' &&
                <NJTooltip key={uuid} text="⏳: This report is still being generated, please wait a moment">
                    <NJIcon name="hourglass_top" variant='lime' />
                </NJTooltip>
            }
            {report.status === 'warning' && (report.errorDetails?.toLowerCase().includes('exceeds') || report.errorDetails?.toLowerCase().includes('no incidents')) ?
                <NJTooltip key={uuid} text={`😕: ${report.errorDetails || 'An unknown error has occurred'}`}>
                    <NJIcon name="running_with_errors" variant='lime' />
                </NJTooltip>
                :
                <>
                    {
                        report.status === 'warning' &&
                        <NJTooltip key={uuid} text={`⚠️: ${report.errorDetails || 'An unknown error has occurred'}`}>
                            <NJIcon name="warning" variant='lime' />
                        </NJTooltip>
                    }
                </>
            }
        </div>
    );
};
