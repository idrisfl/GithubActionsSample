import { delay, http, HttpResponse } from 'msw'
import { IReportRequest } from '../model';
// import { mockReports } from './mockReports';

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export const handlers = [

  // #region Configuration API

  //Get parameter by name
  http.get(`${import.meta.env.VITE_API_ENDPOINT}/parameter/:name`, async (data) => {
    await delay();
    switch (data.params.name) {
      case 'gbus':
        return HttpResponse.json([
          'Flexible Generation',
          'Renewables',
          'Energy Storage',
          'Energy Efficiency',
          'Energy Management',
          'Energy Services',
          'Energy Trading',
        ]);
      case 'lifesavingrules':
        return HttpResponse.json([
          'No live energy'
        ]);
      default:
        return HttpResponse.error();
    }
  }),

  // #endregion

  // #region Suggestions API
  http.post(`${import.meta.env.VITE_API_ENDPOINT}/suggestions`, async (data) => {
    await delay(1000);
    const body = await data.request.json() as {
      for: string;
      request: IReportRequest;
      take?: number;
    };
    const templates = shuffle([
      "Safety First: Incident Report for [Date]",
      "Analyzing Workplace Safety: [Incident Type] Report",
      "Addressing Concerns: [Location] Work Health Incident Documentation",
      "Investigating [Incident Type]: A Comprehensive Incident Report",
      "Ensuring Workplace Wellness: [Date] Incident Analysis",
      "Learning from Challenges: [Incident Type] Report",
      "Prioritizing Safety: Incident Documentation for [Location]",
      "Emergency Response Evaluation: [Date] Incident Report",
      "Enhancing Workplace Health: [Incident Type] Incident Analysis",
      "Building a Safer Environment: [Location] Incident Report",
      "Risk Mitigation and Incident Response: [Date] Report",
      "A Closer Look at Workplace Safety: [Incident Type] Investigation",
      "Creating a Healthier Workspace: [Location] Incident Analysis",
      "Responding to Workplace Challenges: [Incident Type] Report",
      "Lessons Learned: [Date] Work Health Incident Review",
      "Proactive Safety Measures: [Location] Incident Documentation",
      "Understanding and Preventing [Incident Type]: [Date] Report",
      "Investigative Insights: [Incident Type] Incident Report",
      "Striving for Safety Excellence: [Location] Incident Analysis",
      "Cultivating a Safe Culture: [Date] Work Health Incident Report"
    ]);
    return HttpResponse.json(
      templates.map(template => {
        return template.replace(/\[(.*?)\]/g, match => {
          const key = match.substring(1, match.length - 1).toLowerCase();
          switch (key) {
            case 'date':
              const d1 = body.request?.incidentTimeFrame?.from ? new Date(body.request?.incidentTimeFrame?.from).toLocaleDateString() : '';
              const d2 = body.request?.incidentTimeFrame?.to ? new Date(body.request?.incidentTimeFrame?.to).toLocaleDateString() : '';
              return `${d1} - ${d2}`.replace(/undefined/g,'');
            case 'incident type':
              return body.request?.lifeSavingRules?.join(', ') || '';
            case 'location':
              return body.request?.gbus?.join(', ') || '';
            default:
              return match;
          }
        });
      }).slice(0, body.take || 5)
    );
  }),

  // #region Reports API

  //Create report
  // http.post(`${import.meta.env.VITE_API_ENDPOINT}/report`, async (data) => {
  //   await delay(1000);
  //   const body = await data.request.json();
  //   console.log('request', body)
  //   return HttpResponse.json({
  //     id: 0,
  //     status: 'PENDING',
  //     request: body,
  //     created: new Date(),
  //     createdBy: { eMail: 'mock.user@engie.com', title: 'Mock User' }
  //   }
  //   );
  // }),

  //Get report by id
  http.get(`${import.meta.env.VITE_API_ENDPOINT}/report/:id`, async (data) => {
    await delay(1000);
    return HttpResponse.json({
      id: data.params.id,
      status: 'DONE',
      request: {
        title: 'Mock Report',
        gbUs: [{ id: 0, value: 'Flexible Generation' }],
        lifeSavingRules: [{ id: 0, value: 'No live energy' }],
        onlyHipo: false,
        prompt: 'Mock Prompt'
      },
      created: new Date(),
      createdBy: { eMail: 'mock.user@engie.com', title: 'Mock User' }
    });
  }),

  // Get all reports
  // http.get(`${import.meta.env.VITE_API_ENDPOINT}/reports`, async () => {
  //   await delay(1000);
  //   return HttpResponse.json(mockReports);
  // }),

  //Get favorite reports
  // http.get(`${import.meta.env.VITE_API_ENDPOINT}/reports/favorites`, async () => {
  //   await delay(1000);
  //   return HttpResponse.json(mockReports.filter(report => report.isFavorite));
  // }),

  //Delete report by id
  http.delete(`${import.meta.env.VITE_API_ENDPOINT}/report/:id`, async () => {
    await delay(1000);
    return HttpResponse.text('');
  }),

  // #endregion

  // #region DB API
  // http.get(`${import.meta.env.VITE_API_ENDPOINT}/incidents/current-db`, async () => {
  //   await delay(1000);
  //   return HttpResponse.json({
  //     "UploadedDate": "2024-01-11T10:26:08.105Z",
  //     "UploadedBy": "Mock user",
  //     "OriginalFileName": "mock-indicents.csv",
  //     "NumberOfIncidents": 15,
  //     "MostRecentIncident": {
  //       "IncidentId": "INC-25",
  //       "Description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  //       "Date": "2024-01-11T10:26:08.105Z"
  //     }
  //   });
  // })

]
