export interface IGBU {
  id: string;
  value: string;
}
export interface ILifeSavingRule {
  id: string;
  title: string;
}
export interface IReportRequest {
  title: string;
  incidentTimeFrame: {
    from: Date;
    to: Date;
  };
  gbus?: string[];
  lifeSavingRules?: string[];
  onlyHipo?: boolean;
  prompt: string;
  createdBy: string;
}

export interface IReportResponse {
  id: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "ERROR";
  isFavorite?: boolean;
  request: IReportRequest;
  created: Date;
  createdBy: { eMail: string; title: string };
  error?: string;
}

export interface IDBStatusResponse {
  uploadedDate: string;
  uploadedBy: string;
  originalFileName: string;
  numberOfIncidents: number;
  mostRecentIncident?: {
    incidentId: string;
    description: string;
    date: string;
  };
  status: {
    status: string;
    message: string;
    filename: string;
  };
  pickle: string;
}
export interface IDBStatus {
  uploadedDate: Date;
  uploadedBy: string;
  originalFileName: string;
  numberOfIncidents: number;
  mostRecentIncident?: {
    incidentId: string;
    description: string;
    date: Date;
  };
  status: {
    status: string;
    message: string;
    filename: string;
  };
  pickle: string;
}
export interface IReport {
  title: string;
  createdBy: string;
  createdDate: string;
  query: string;
  systemCompletion: string;
  relatedIncidents: Array<{ id: number; title: string | null }>;
  skippedIncidents: any[];
  runCosts: {
    models: Array<{
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        promptCosts: number;
        completionCosts: number;
        totalCosts: number;
      };
    }>;
    totalCost: number;
  };
  runTimeSeconds: number;
  criteria: string;
  oxDotMap: string;
  queryId: string;
  filters: {
    incidentTimeFrame: {
      from: string;
      to: string;
    };
    gbus: any[];
    lifeSavingRules: string[];
    onlyHipo: boolean;
  };
  pickleUploaded: string;
  status: "success" | "error" | "in progress" | "warning" | undefined;
  errorDetails?: string;
}

export interface IUserInfo {
  access_token?: string;
  expires_on?: string;
  id_token?: string;
  provider_name?: string;
  user_claims?: { typ: string; val: string }[];
  user_id?: string;
}
