/**
 * FN7 SDK Initialization
 * Configures and exports the FN7 SDK instance
 *
 * Following the SDK pattern: https://fn7.io/.fn7-sdk/frontend/latest/docs
 *
 * SDK Modes:
 * - 'local': Local development mode - skips backend authentication calls
 * - 'server': Production mode - calls backend to get Firebase custom token
 *
 * To use environment-specific configs, update the import below:
 * - For local: import { environment } from './config/environment';
 * - For dev: import { environment } from './config/environment.dev';
 * - For prod: import { environment } from './config/environment.prod';
 */

import FN7SDK from 'https://fn7.io/.fn7-sdk/frontend/latest/sdk.esm.js';
// Import the appropriate environment file based on your build configuration
import { environment } from './config/environment'; // Change to .dev or .prod as needed

// Determine SDK mode based on apiBaseUrl
const mode = environment.apiBaseUrl ? 'server' : 'local';

// Initialize SDK with unified config object
const sdk = new FN7SDK({
  mode: mode,
  firebaseConfig: environment.firebase,
  apiBaseUrl: environment.apiBaseUrl  // Only used in server mode
});

// In local mode, populate localStorage with default values
// This allows the app to access user_context and app_context for other needs
// The SDK respects localStorage over hardcoded defaults
if (mode === 'local') {
  try {
    // Set default user_context if not already present
    if (!localStorage.getItem('user_context')) {
      localStorage.setItem('user_context', JSON.stringify({
        user_id: '0513467084',
        org_hkey: '7000000001.0742402695',
        user_role: 'Founder',
        org_role: 'Provider',
        application_id: '1000000001',
        id_token: 'local-dev-token'
      }));
    }

    // Set default app_context if not already present
    if (!localStorage.getItem('app_context')) {
      localStorage.setItem('app_context', JSON.stringify({
        doc_id: '1000000001',
        org_hkey: '7000000001',
        application_url_prefix: 'atlas'
      }));
    }
  } catch (e) {
    console.warn('Could not set localStorage defaults:', e);
  }
}

export default sdk;

