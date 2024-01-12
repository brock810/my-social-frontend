import React from 'react';
import Link from 'next/link';
import {
  FaUserFriends,
  FaRegNewspaper,
  FaComments,
  FaRocket
} from 'react-icons/fa';
import styles from '../styles/page.module.css';
import friendsStyles from '../styles/Friends.module.css';

// Define the DashboardCardProps interface
interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  additionalText?: string;
}

// DashboardCard Component
const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, description, additionalText }) => (
  <div className={`bg-white rounded-xl p-6 shadow-md text-center w-64 mb-8 ${styles['text-black']}`}>
    <div className="text-4xl mb-4 text-blue-500">{icon}</div>
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <p className={`text-sm opacity-70 ${styles['text-black']} ${styles.p}`}>{description}</p>
    {additionalText && <p className={`text-sm opacity-70 ${styles['text-black']} ${styles.p}`}>{additionalText}</p>}
  </div>
);

// Home Component
export default function Home() {
  return (
    <main className={`${friendsStyles['friends-container']} text-white min-h-screen`}>
      {/* Welcome Section */}
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Social Dashboard</h1>
        <p className={`text-lg opacity-80 ${styles.p}`}>
          Explore, Connect, and Share with your Social Trends!
        </p>
      </div>

      {/* Dashboard Cards Section */}
      <div className="flex flex-wrap justify-center gap-8">
        <Link href="/friends">
          <DashboardCard
            icon={<FaUserFriends size={40} />}
            title="Friends"
            description="Connect with friends and grow your network."
          />
        </Link>
        <Link href="/news-feed">
          <DashboardCard
            icon={<FaRegNewspaper size={40} />}
            title="News Feed"
            description="Stay updated with the latest news and posts."
          />
        </Link>
        <Link href="/messages">
          <DashboardCard
            icon={<FaComments size={40} />}
            title="Messages"
            description="Chat with your friends and colleagues."
          />
        </Link>
        <Link href="/explore">
          <DashboardCard
            icon={<FaRocket size={40} />}
            title="Explore"
            description="Discover new content and trends."
          />
        </Link>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 left-0 flex items-center justify-center w-full pb-4">
        {/* Placeholder for a link (can be customized) */}
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
        </a>
      </div>
    </main>
  );
}
