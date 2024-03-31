import { MsalAuthenticationResult } from "@azure/msal-react";

export const MsalErrorComponent: React.FC<MsalAuthenticationResult> = ({error}) => {
    return <span>An Error Occurred: {error ? error.errorCode : "unknown error"}</span>;
}