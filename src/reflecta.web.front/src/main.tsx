import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@engie-group/fluid-design-system/lib/base.css'
import '@engie-group/fluid-design-tokens/lib/css/tokens.css'
import './index.css'
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from "history";

async function prepareMocks() {
  if (import.meta.env.VITE_ENABLE_MOCK === "true") {
    const { worker } = await import('./mocks/browser')
    return worker.start()
  }
  return Promise.resolve()
}
function initAppInsights() {
  console.log("import.meta.env.VITE_APPINSIGHTS_KEY",import.meta.env.VITE_APPINSIGHTS_KEY);
  if(!import.meta.env.VITE_APPINSIGHTS_KEY){
    return;
  }
  const browserHistory = createBrowserHistory();
  var reactPlugin = new ReactPlugin();
  var appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: import.meta.env.VITE_APPINSIGHTS_KEY,
      extensions: [reactPlugin],
      extensionConfig: {
        [reactPlugin.identifier]: { history: browserHistory }
      }
    }
  });
  appInsights.loadAppInsights();
}

prepareMocks().then(() => {

  initAppInsights();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
});
