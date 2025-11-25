import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Configuration object for HTTP requests, excluding the URL.
 * Extends Axios request configuration with all options except the url parameter.
 *
 * @template V - The type of the request body data (defaults to unknown)
 */
export type RequestConfig<V = unknown> = Omit<AxiosRequestConfig<V>, 'url'>;

/**
 * Function type that performs an HTTP request to a specified URL.
 *
 * @template R - The type of the response data (defaults to unknown)
 * @template V - The type of the request body data (defaults to unknown)
 *
 * @param {string} url - The endpoint URL to send the request to
 * @param {Readonly<RequestConfig<V>>} [config] - Optional request configuration
 *
 * @returns {Promise<AxiosResponse<R, V>>} A promise that resolves to the Axios response
 */
export type RequestHelperFunction = <R = unknown, V = unknown>(
  url: string,
  config?: Readonly<RequestConfig<V>>,
) => Promise<AxiosResponse<R, V>>;

/**
 * Parameters required to configure the request maker.
 *
 * @property {string} baseUrl - The base URL for all HTTP requests made by this instance
 */
export type MakeRequestParameters = Readonly<{
  baseUrl: string;
}>;

/**
 * Factory function type that creates a configured HTTP request helper.
 * Takes base configuration and returns a function that can make requests to specific endpoints.
 *
 * @param {Readonly<MakeRequestParameters>} parameters - Configuration parameters including the base URL
 *
 * @returns {RequestHelperFunction} A configured function that can perform HTTP requests
 */
export type MakeRequest = (
  parameters: Readonly<MakeRequestParameters>,
) => RequestHelperFunction;
