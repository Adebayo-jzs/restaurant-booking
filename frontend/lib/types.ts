export interface TimeSlot {
    time: string;
    capacity: number;
}

export interface Availability {
    id?: string;
    date: string;
    timeSlots: TimeSlot[];
}

export interface Restaurant {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    cuisine: string;
    startingPrice?: number | null;
    capacity?: number | null;
    address: string;
    city: string;
    state?: string | null;
    country: string;
    email: string;
    phoneNumber: string;
    logoUrl?: string | null;
    coverImage?: string | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    availabilities?: Availability[];
    ownerId?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface Booking {
    id: string;
    bookingDate: string;
    bookingTime: string;
    numberOfPeople: number;
    status: BookingStatus;
    specialRequests?: string | null;
    userId?: string | null;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    isVerified: boolean;
    reminderSent: boolean;
    restaurantId: string;
    restaurant?: {
        id: string;
        name: string;
        slug?: string;
        logoUrl?: string | null;
        coverImage?: string | null;
        address: string;
        city: string;
        cuisine?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'OWNER' | 'ADMIN';
    phoneNumber?: string | null;
    isVerified: boolean;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RestaurantsResponse {
    success: boolean;
    restaurants?: Restaurant[];
    pagination?: Pagination;
    data?: {
        restaurants: Restaurant[];
        pagination: Pagination;
    };
}

export interface SingleRestaurantResponse {
    success: boolean;
    restaurant?: Restaurant;
    data?: Restaurant;
    message?: string;
}

export interface BookingResponse {
    success: boolean;
    message: string;
    data?: Booking;
}

export interface UserBookingsResponse {
    success: boolean;
    data: Booking[];
}

export interface AuthResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    token?: string;
    user?: User;
    data?: User | {
        user?: User;
        token?: string;
        accessToken?: string;
    };
}
