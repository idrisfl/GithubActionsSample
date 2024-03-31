import { IDBStatus, IDBStatusResponse, ILifeSavingRule, IReport, IReportRequest, IReportResponse, IUserInfo } from "../model";
import axios, { AxiosInstance } from "axios";

export async function getGBUs(): Promise<string[]> {
  const client = await getClient();
  const response = await client!.get('/configuration/gbus');
  return response.data;
}

export async function getLifeSavingRules(): Promise<ILifeSavingRule[]> {
  const client = await getClient();
  const response = await client!.get('/configuration/life-saving-rules');
  return response.data;
}

export async function createReport(report: IReportRequest | FormData): Promise<IReportResponse> {
  const client = await getClient();
  let typedReport: IReportRequest;
  if (report instanceof FormData) {
    typedReport = fromDataToReportRequest(report);
  } else {
    typedReport = report;
  }
  const from = (new Date(typedReport.incidentTimeFrame?.from ?? new Date()))?.toISOString()?.replace('Z', '+00:00');
  const to = (new Date(typedReport.incidentTimeFrame?.to ?? new Date()))?.toISOString()?.replace('Z', '+00:00');
  const response = await client!.post<IReportResponse>('/reports', {
    ...typedReport,
    incidentTimeFrame: typedReport.incidentTimeFrame ? {
      from,
      to
    }:null,
    onlyHipo: typedReport.onlyHipo ?? false
  });
  return response.data;
}
export async function deleteReport(id: string): Promise<void> {
  const client = await getClient();
  const response = await client!.delete<void>(`/reports/${id}`);
  return response.data;
}

export async function getReports(): Promise<IReport[]> {
  const client = await getClient();
  const response = await client!.get<IReport[]>('/reports');
  return response.data;
}

export async function getFavoriteReports(): Promise<IReportResponse[]> {
  const client = await getClient();
  const response = await client!.get<IReportResponse[]>('/reports/favorites');
  return response.data;
}

export async function getReport(id: string): Promise<IReport> {
  //TODO: Call dedicated endpoint
  const reports = await getReports();
  const report = reports.find(r => r.queryId === id);
  if(!report){
    throw new Error(`Report with id ${id} not found`);
  }
  return report;
}

export async function getTitleSuggestion(request: IReportRequest): Promise<string> {
  const client = await getClient();
  const response = await client!.post<{title:string}>('/title/generate-title', {
    ...request,
    title: request.title || '',
    gbus: request.gbus || [],
    lifeSavingRules: request.lifeSavingRules || [],
    prompt: request.prompt || '',
    onlyHipo: !!request.onlyHipo
  } as IReportRequest);
  return response.data?.title;
}

// #region DB API

export async function getDBStatus(): Promise<IDBStatus> {
  const client = await getClient();
  const response = await client!.get<IDBStatusResponse>('/database/current');
  return {
    ...response.data,
    uploadedDate: new Date(response.data.uploadedDate),
    mostRecentIncident: response.data.mostRecentIncident?{
      incidentId: response.data.mostRecentIncident.incidentId,
      description: response.data.mostRecentIncident.description,
      date: new Date(response.data.mostRecentIncident.date)
    }:undefined
  };
}
export async function uploadIncidentsDB(formData: FormData): Promise<void> {
  const client = await getClient();
  await client!.post<void>('/database/upload', formData,{
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// #region Private methods
const _clients: {[endpoint:string]:AxiosInstance | undefined} = {};

const getClient = async (apiEndpoint?:string) => {
  const endpoint = apiEndpoint || import.meta.env.VITE_API_ENDPOINT;
  if (!_clients[endpoint]) {
    _clients[endpoint] = await getAuthenticatedAxiosInstance(endpoint);
  }
  return _clients[endpoint];
};

const fromDataToReportRequest = (formData: FormData): IReportRequest => {
  const reportCreationRequest: { [key: string]: any } = {};
  for (const [key, value] of formData.entries()) {
    if (value === 'undefined' || value === 'null' || value === '') {
      reportCreationRequest[key] = undefined;
      continue;
    }
    try {
      const parsedValue = JSON.parse(value as string);
      reportCreationRequest[key] = parsedValue;
    } catch (e) {
      reportCreationRequest[key] = undefined;
      console.error('Error parsing value', key, value);
    }
  }
  return reportCreationRequest as IReportRequest;
};

export async function getAuthenticatedAxiosInstance(apiEndpoint: string): Promise<AxiosInstance> {

  return axios.create({
    baseURL: apiEndpoint,
    headers: {
      'Content-Type': 'application/json',
      //'Authorization': `Bearer ${hardcodedToken}`,
    },
  });
}

export async function getAuthUserInfo(): Promise<IUserInfo | null> {
  const client = await getClient();
  const frontendDomainUrl = window.location.origin;
  const authEndpoint = `${frontendDomainUrl}/.auth/me`;
  const response = await client!.get(authEndpoint);

  const userInfo = response.data;
  console.log('getAuthUserInfo() UserInfo:', userInfo);
  return userInfo[0];
}

// #endregion