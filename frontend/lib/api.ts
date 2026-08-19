import { RestaurantsResponse, SingleRestaurantResponse, BookingResponse, UserBookingsResponse } from './types';

const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://restaurant-booking-backend.adedejiadebayo732.workers.dev';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

interface FetchOptions extends RequestInit {
    token?: string;
    next?: { revalidate?: number };
}

export async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options;
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            ...defaultHeaders,
            ...headers,
        },
        credentials: 'include',
        ...rest,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
}

// ── Restaurant Queries ────────────────────────────────────────────────────────
export async function getRestaurants(params: { city?: string; cuisine?: string; search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.city) query.append('city', params.city);
    if (params.cuisine) query.append('cuisine', params.cuisine);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<RestaurantsResponse>(`/restaurants${queryString}`, { next: { revalidate: 60 } });
}

export async function getRestaurantByIdOrSlug(identifier: string) {
    return fetchApi<SingleRestaurantResponse>(`/restaurants/${identifier}`, { next: { revalidate: 30 } });
}

// ── Booking Actions ───────────────────────────────────────────────────────────
export interface CreateBookingPayload {
    bookingDate: string;
    bookingTime: string;
    numberOfPeople: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests?: string;
}

export async function createBooking(restaurantId: string, payload: CreateBookingPayload, token?: string) {
    return fetchApi<BookingResponse>(`/bookings/${restaurantId}/book`, {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
    });
}

export async function verifyGuestBooking(bookingId: string, otp: string) {
    return fetchApi<BookingResponse>(`/bookings/${bookingId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ otp }),
    });
}

export async function getUserBookings(token?: string) {
    return fetchApi<UserBookingsResponse>('/bookings/my-bookings', {
        token,
        cache: 'no-store',
    });
}

export async function cancelBooking(bookingId: string, token?: string) {
    return fetchApi<BookingResponse>(`/bookings/${bookingId}/cancel`, {
        method: 'POST',
        token,
    });
}

export async function acceptBooking(bookingId: string, token?: string) {
    return fetchApi<BookingResponse>(`/bookings/${bookingId}/accept`, {
        method: 'POST',
        token,
    });
}

export async function rejectBooking(bookingId: string, token?: string) {
    return fetchApi<BookingResponse>(`/bookings/${bookingId}/reject`, {
        method: 'POST',
        token,
    });
}
