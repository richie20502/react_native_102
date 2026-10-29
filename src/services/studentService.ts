/**
 * Servicio de estudiantes
 */

import apiClient from '../api/client';
import { Student } from '../types/student';

class StudentService {
  private baseUrl = '/api/students';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  async getAll(): Promise<Student[]> {
    const cacheKey = 'all-students';
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const response = await apiClient.get<{ data: Student[] }>(this.baseUrl);
    const students = response.data.data;
    
    this.cache.set(cacheKey, {
      data: students,
      timestamp: Date.now(),
    });
    
    return students;
  }

  async getById(id: number): Promise<Student> {
    const cacheKey = `student-${id}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const response = await apiClient.get<{ data: Student }>(`${this.baseUrl}/${id}`);
    const student = response.data.data;
    
    this.cache.set(cacheKey, {
      data: student,
      timestamp: Date.now(),
    });
    
    return student;
  }

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const response = await apiClient.post<{ data: Student }>(this.baseUrl, student);
    const newStudent = response.data.data;
    
    this.cache.clear();
    
    return newStudent;
  }

  async update(id: number, student: Partial<Student>): Promise<Student> {
    const response = await apiClient.put<{ data: Student }>(`${this.baseUrl}/${id}`, student);
    const updatedStudent = response.data.data;
    
    this.cache.delete(`student-${id}`);
    this.cache.delete('all-students');
    
    return updatedStudent;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
    
    this.cache.delete(`student-${id}`);
    this.cache.delete('all-students');
  }

  async search(query: string): Promise<Student[]> {
    const response = await apiClient.get<{ data: Student[] }>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
    return response.data.data;
  }
}

export const studentService = new StudentService();
