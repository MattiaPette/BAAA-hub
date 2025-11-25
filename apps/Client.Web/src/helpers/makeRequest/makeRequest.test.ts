import axios, { AxiosInstance } from 'axios';
import { vi, describe, it, expect } from 'vitest';
import { makeRequest } from './makeRequest';

describe('makeRequest', () => {
  const mockBaseUrl = 'http://example.com';
  const mockUrl = '/test';
  const mockConfig = { headers: { 'Content-Type': 'application/json' } };

  it('Should make a GET request with the correct URL and config', async () => {
    const mockResponse = { data: 'response data' };
    const axiosCreateSpy = vi
      .spyOn(axios, 'create')
      .mockReturnValue(
        vi.fn(() => Promise.resolve(mockResponse)) as unknown as AxiosInstance,
      );

    const request = makeRequest({ baseUrl: mockBaseUrl });
    const response = await request(mockUrl, mockConfig);

    expect(axiosCreateSpy).toHaveBeenCalledWith({ baseURL: mockBaseUrl });
    expect(response).toEqual(mockResponse);

    axiosCreateSpy.mockRestore();
  });

  it('Should handle errors correctly', async () => {
    const mockError = new Error('Request failed');
    const axiosCreateSpy = vi
      .spyOn(axios, 'create')
      .mockReturnValue(
        vi.fn(() => Promise.reject(mockError)) as unknown as AxiosInstance,
      );

    const request = makeRequest({ baseUrl: mockBaseUrl });

    await expect(request(mockUrl, mockConfig)).rejects.toThrow(
      'Request failed',
    );

    axiosCreateSpy.mockRestore();
  });
});
