
import './App.css'
import { RouterProvider, createBrowserRouter, defer, redirect } from 'react-router-dom'
import { PageLayout } from './PageLayout';
import { ReportsNew } from './pages/ReportsNew/ReportsNew';
import { ErrorComponent } from './ui-components/ErrorComponent/ErrorComponent';
import { useState } from 'react';
import { LoadingComponent } from './ui-components/LoadingComponent/LoadingComponent';
import { ReportPage } from './pages/Report/ReportPage';
import { createReport, getDBStatus, getGBUs, getLifeSavingRules, getReport, getReports, uploadIncidentsDB } from './utils/restApiCalls';
import { ManageDBPage } from './pages/ManageDBPage/ManageDBPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { NJToastContainer, NJToastService } from '@engie-group/fluid-design-system-react';
const pageTitles: { [path: string]: string } = {
  '/': 'Reports',
  '/report': 'New Report',
  '/reports': 'Reports',
  '/incidentsdb': 'Update Database'
}

function App() {

  const [loadingMessage, setLoadingMessage] = useState('');

  const router = createBrowserRouter([
    {
      element: (
        <PageLayout pageTitles={pageTitles} nonSecuredPaths={['/login/callback']} />
      ),
      errorElement: <ErrorComponent />,
      children: [
        {
          path: "/",
          element: <ReportsPage />,
          errorElement: <ErrorComponent />,
          loader: async () => {
            return defer({
              reports: getReports()
            });
          }
        },
        {
          path: "/reports",
          element: <ReportsPage />,
          errorElement: <ErrorComponent />,
          loader: async () => {
            return defer({
              reports: getReports()
            });
          }
        },
        {
          path: "/report",
          element: <ReportsNew />,
          loader: async () => {
            return defer({
              formValues: Promise.all([
                getGBUs(),
                getLifeSavingRules()
              ])
            });
          },
          action: async ({ request }) => {
            setLoadingMessage('Saving report...');
            try {
              await createReport(await request.formData());
              NJToastService(`The creation of you report has been added to the queue and will appear in the report list shortly.`, { title: 'Report successfully added to the queue', iconName: "check" });
              return redirect(`/reports`);
            } catch (error) {
              NJToastService(`Error creating report`, { iconName: "dangerous" });
              console.error(error);
            } finally {
              setLoadingMessage('');
            }
          },
          errorElement: <ErrorComponent />
        },
        {
          path: "/report/:reportId",
          element: <ReportPage />,
          loader: async ({ params }) => {
            if (!params.reportId) {
              throw new Error('Missing report id');
            }
            return defer({
              report: getReport(params.reportId)
            });
          },
          // action: async ({ params, request }) => {
          //   switch (request.method) {
          //     case 'DELETE':
          //       setLoadingMessage('Deleting report...');
          //       await deleteReport(reportId!);
          //       setLoadingMessage('');
          //       return redirect('/');
          //     default:
          //       return redirect(`/report/${params.reportId}`);
          //   }
          // },
          errorElement: <ErrorComponent />
        },
        {
          path: "/incidentsdb",
          element: <ManageDBPage />,
          loader: async () => {
            return defer({
              dbStatus: getDBStatus()
            });
          },
          action: async ({ request }) => {
            setLoadingMessage('Uploading file...');
            try {
              await uploadIncidentsDB(await request.formData());
              NJToastService("File uploaded successfully. Database status will be updated shortly.", { iconName: "check" });
            } catch (error) {
              console.error(error);
              NJToastService("Error uploading file", { iconName: "dangerous" });
            } finally {
              setLoadingMessage('');
            }
          },
          errorElement: <ErrorComponent />
        }

      ]
    }
  ]);
  return (
    <>
      <NJToastContainer />
      <LoadingComponent message={loadingMessage} />
      <RouterProvider router={router} />
    </>
  )
}

export default App
