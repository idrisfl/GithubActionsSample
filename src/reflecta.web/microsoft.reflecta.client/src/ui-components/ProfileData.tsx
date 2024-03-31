
export type GraphData = {
    displayName: string,
    jobTitle: string,
    mail: string,
    businessPhones: string[],
    officeLocation: string
};

export const ProfileData: React.FC<{graphData: GraphData}> = ({graphData}) => {
    return (
        <div className="profileData">
            <div>{graphData.displayName}</div>
            <div>{graphData.jobTitle}</div>
            <div>{graphData.mail}</div>
            <div>{graphData.businessPhones[0]}</div>
            <div>{graphData.officeLocation}</div>
        </div>
    );
};