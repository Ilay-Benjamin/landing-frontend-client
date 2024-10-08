import { loadAppConfig } from './../config/app/initializeApp.js';
import { loadDatabaseConfig } from './../config/global/initializeDB.js';
import { appEnvironment, getApiKey } from './../config/app/app.config.js';
import { getFirebaseConfigurations, getFirebaseServiceAccount } from './../config/global/global.config';
import { establishConnection } from '../services/Firebase/connection.js';
import { isAuthorized } from './../services/auth.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppModel from './../models/app/app.model.js';

export default class AppController {

    constructor() {
        this._app = null;
        this._apiKey = null;
        this._firebase = {
            configurations: null,
            serviceAccount: null
        };
    }

    get app() {
        return this._app;
    }
    
    set app(newApp) {
        this._app = newApp;
    }

    getApiKey() {
        return this._apiKey;
    }

    async _setApiKey(newApiKey) {
        try {
            if (!newApiKey) {
                throw new Error('API key is missing');
            }
            const authorized = await isAuthorized(newApiKey);
            if (!authorized) {
                throw new Error('Not authorized');
            }
            this._apiKey = newApiKey;

        } catch (error) {
            console.error("Error setting API key:", error.message);
        }
    }

    async _setFirebase(newFirebaseConfigurations, newFirebaseServiceAccount) {
        try {
            if (!newFirebaseConfigurations || !newFirebaseServiceAccount) {
                throw new Error('Firebase configurations or service account missing');
            }
            this._firebase.configurations = newFirebaseConfigurations;
            this._firebase.serviceAccount = newFirebaseServiceAccount;
        } catch (error) {
            console.error("Error setting Firebase configurations:", error.message);
        }
    }

    async initialize(apiKey) {
        loadAppConfig(apiKey);
        const results = establishConnection(apiKey);
        if (results) {
            loadDatabaseConfig(results.firebaseConfigurations, results.firebaseServiceAccount);
        }
        this.app = AppController.createApp(apiKey);
    }

    static createApp(apiKey) {
        const root = AppModel.getDefaultRoot();
        const app = AppModel.getDefaultReactNode(apiKey);
        ReactDOM.createRoot(root).render(
            <React.StrictMode>
                {app}
            </React.StrictMode>
        );
    }
}

export function runApp(apiKey) {
    const appController = new AppController();
    appController.initialize(apiKey);
}

export function initializeApp(apiKey) {
    // Any additional initialization logic
}

export function buildApp() {
    return (
        <React.StrictMode>
            <App apiKey={appEnvironment.apiKey} />
        </React.StrictMode>
    );
}

export function renderApp(root) {
    const builtApp = buildApp();
    ReactDOM.createRoot(root).render(builtApp);
}
