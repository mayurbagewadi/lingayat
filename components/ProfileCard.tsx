import React from 'react';
import Image from 'next/image';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  id: string;
  name: string;
  photoUrl: string;
  photoCount: number;
  onViewProfile: (userId: string) => void;
  onExpress: (userId: string) => void;
  isLoading?: boolean;
}

export default function ProfileCard({
  id,
  name,
  photoUrl,
  photoCount,
  onViewProfile,
  onExpress,
  isLoading = false
}: ProfileCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <div className={styles.image}>
          <img
            src={photoUrl}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder.jpg';
            }}
          />
        </div>
        <div className={styles.photoCount}>
          📷 {photoCount}
        </div>
      </div>

      <div className={styles.content}>
        <h3>{name}</h3>
        <p className={styles.subtitle}>Active Member</p>
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary"
          onClick={() => onViewProfile(id)}
          disabled={isLoading}
        >
          View Profile
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => onExpress(id)}
          disabled={isLoading}
        >
          Express Interest
        </button>
      </div>
    </div>
  );
}
