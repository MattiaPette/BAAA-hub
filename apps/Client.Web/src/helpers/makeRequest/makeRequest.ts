import axios from 'axios';

import { MakeRequest } from './makeRequest.model';

/**
 * Asynchronous function that creates an axios instance with a specified base URL
 * and performs a GET request to a given URL with optional configuration.
 *
 * @param {Object} options - An object containing options for the request.
 * @param {string} options.baseUrl - The base URL for the axios instance.
 * @returns {Function} A function that accepts a URL and an optional configuration as parameters.
 *
 * @example
 * const request = makeRequest({ baseUrl: 'https://api.example.com' });
 * const response = await request('/endpoint', { headers: { 'Authorization': 'Bearer token' } });
 */
export const makeRequest: MakeRequest =
  ({ baseUrl }) =>
  async (url, config) => {
    const instance = axios.create({ baseURL: baseUrl });

    return instance(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      ...config,
    });
  };
