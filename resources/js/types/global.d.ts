import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { AxiosInstance } from 'axios';
import { route as ziggyRoute } from 'ziggy-js';
import { PageProps as AppPageProps } from './';

declare global {
    interface Window {
        axios: AxiosInstance;
        Ziggy?: {
            routes?: Record<string, unknown>;
            [key: string]: unknown;
        };
    }

    /* eslint-disable no-var */
    var route: typeof ziggyRoute;
}

declare module '@inertiajs/core' {
    interface PageProps extends InertiaPageProps, AppPageProps {}
}

export interface FlashProps {
  success?: string
  error?: string
  generated_password?: string
}

export interface PageProps extends InertiaPageProps {
  flash: FlashProps
}
