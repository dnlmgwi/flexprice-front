import { AxiosClient } from '@/core/axios/verbs';
import { generateQueryParams } from '@/utils/common/api_helper';
import {
	CreateCreditGrantRequest,
	UpdateCreditGrantRequest,
	CreditGrantResponse,
	ListCreditGrantsResponse,
	CreditGrantFilter,
	SearchCreditGrantsRequest,
	SearchCreditGrantsResponse,
	CancelFutureCreditGrantRequest,
	DeleteCreditGrantRequest,
} from '@/types/dto';

class CreditGrantApi {
	private static baseUrl = '/creditgrants';

	/**
	 * Create a new credit grant
	 * @param data - Credit grant configuration
	 * @returns Promise<CreditGrantResponse>
	 */
	public static async create(data: CreateCreditGrantRequest) {
		return AxiosClient.post<CreditGrantResponse, CreateCreditGrantRequest>(this.baseUrl, data);
	}

	/**
	 * Get a credit grant by ID
	 * @param id - Credit grant ID
	 * @returns Promise<CreditGrantResponse>
	 */
	public static async get(id: string) {
		return await AxiosClient.get<CreditGrantResponse>(`${this.baseUrl}/${id}`);
	}

	/**
	 * List credit grants with filters (GET method with query params)
	 * @param filters - Filter parameters
	 * @returns Promise<ListCreditGrantsResponse>
	 */
	public static async list(filters: CreditGrantFilter) {
		const url = generateQueryParams(this.baseUrl, filters);
		return await AxiosClient.get<ListCreditGrantsResponse>(url);
	}

	/**
	 * Search credit grants with complex filters (POST /creditgrants/search)
	 * @param payload - Complex filters, sorts, and pagination
	 * @returns Promise<SearchCreditGrantsResponse>
	 */
	public static async search(payload: SearchCreditGrantsRequest) {
		return await AxiosClient.post<SearchCreditGrantsResponse>(`${this.baseUrl}/search`, payload);
	}

	/**
	 * Update a credit grant
	 * @param id - Credit grant ID
	 * @param data - Updated credit grant configuration
	 * @returns Promise<CreditGrantResponse>
	 */
	public static async update(id: string, data: UpdateCreditGrantRequest) {
		return await AxiosClient.put<CreditGrantResponse, UpdateCreditGrantRequest>(`${this.baseUrl}/${id}`, data);
	}

	/**
	 * Delete a credit grant
	 * @param id - Credit grant ID
	 * @param data - Optional delete configuration with effective_date
	 * @returns Promise<void>
	 */
	public static async delete(id: string, data?: DeleteCreditGrantRequest) {
		return await AxiosClient.delete<void, DeleteCreditGrantRequest>(`${this.baseUrl}/${id}`, data);
	}

	/**
	 * Cancel future credit grant applications
	 * @param data - Cancel configuration
	 * @returns Promise<void>
	 */
	public static async cancelFuture(data: CancelFutureCreditGrantRequest) {
		return await AxiosClient.post<void, CancelFutureCreditGrantRequest>(`${this.baseUrl}/cancel`, data);
	}
}

export default CreditGrantApi;
