import React from 'react';

export interface BioFormData {
  name: string;
  age: string;
  gender: 'Groom' | 'Bride';
  education: string;
  profession: string;
  location: string;
  values: string;
  hobbies: string;
}

export interface Testimonial {
  id: number;
  couple: string;
  story: string;
  image: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: React.ElementType;
}