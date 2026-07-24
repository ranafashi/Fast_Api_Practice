import { api } from "./client";
import type {
  AvgAgeByCity,
  CityUserRow,
  DeleteUserResponse,
  User,
  UserCountByCity,
} from "../types";

export async function getAllUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/get_all_registered_users");
  return data;
}

export async function deleteUser(email: string, name?: string): Promise<DeleteUserResponse> {
  const { data } = await api.delete<DeleteUserResponse>("/delete_user", {
    params: { email, ...(name ? { name } : {}) },
  });
  return data;
}

export async function getUsersCities(): Promise<CityUserRow[]> {
  const { data } = await api.get<CityUserRow[]>("/get_users_cities");
  return data;
}

export async function getUserCountByCity(): Promise<UserCountByCity[]> {
  const { data } = await api.get<UserCountByCity[]>("/get_user_count");
  return data;
}

export async function getAvgAgeByCity(): Promise<AvgAgeByCity[]> {
  const { data } = await api.get<AvgAgeByCity[]>("/get_avg_age");
  return data;
}
