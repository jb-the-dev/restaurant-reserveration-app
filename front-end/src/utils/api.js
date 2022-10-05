/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function readReservation(reservationId){
  return axios.get(`${API_BASE_URL}/reservations/${reservationId}`)
}

export async function createReservation(newReservation) {
  return axios.post(`${API_BASE_URL}/reservations`, newReservation)
}

export async function updateReservation(reservationId, updatedReservation) {
  return axios.put(`${API_BASE_URL}/reservations/${reservationId}`, updatedReservation)
}

export async function getTables(){
  return axios.get(`${API_BASE_URL}/tables`)
}

export async function seatTable(tableId, config) {
  return axios.put(`${API_BASE_URL}/tables/${tableId}/seat`, config)
}

export async function createTable(newTable) {
  return axios.post(`${API_BASE_URL}/tables`, newTable)
}

export async function unseatReservation(tableId){
  return axios.delete(`${API_BASE_URL}/tables/${tableId}/seat`)
}
//TODO remove config from seatReservation in ReservationList.js, and refactor seatRes and cancelRes (below) to accept a status param as a string

export async function seatReservation(reservationId, config) {
  return axios.put(`${API_BASE_URL}/reservations/${reservationId}/status`, config)
}

export async function cancelReservation(reservationId) {
  const config = { data: { status: "cancelled" }}
  return axios.put(`${API_BASE_URL}/reservations/${reservationId}/status`, config)
}