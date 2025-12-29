'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/types';
import { formatPostDate } from '@/lib/utils/dateUtils';
import React from 'react';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href={`/profile/${post.userId}`} className="flex items-center flex-1 hover:opacity-80 transition-opacity">
          {post.userAvatar ? (
            <Image
              src={post.userAvatar}
              alt={post.userName}
              width={40}
              height={40}
              className="rounded-full mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">
                {post.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{post.userName}</p>
            <p className="text-xs text-gray-500">{formatPostDate(post.createdAt)}</p>
          </div>
        </Link>
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block hover:bg-gray-50 transition-colors">
        <div className="p-4">
          <p className="text-gray-900 mb-3 whitespace-pre-wrap break-words">{post.content}</p>
          {post.imageUrl && (
            <div className="rounded-lg overflow-hidden mb-3">
              <Image
                src={post.imageUrl}
                alt="Post image"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button
          onClick={onLike}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          <svg
            className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
            fill={post.isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className={`text-sm font-medium ${post.isLiked ? 'text-red-500' : ''}`}>
            {post.likesCount}
          </span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center space-x-2 text-gray-600 hover:text-teal-500 transition-colors"
        >
          <svg 
            className="w-6 h-6 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>

        <button className="flex items-center space-x-2 text-gray-600 hover:text-teal-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342c8.288 0 12-3.94 12-7.908 0-4.356-3.712-8.434-12-8.434S-3.288 1.078-3.288 5.434c0 3.969 3.712 7.908 12 7.908m0 0l3.712-3.712m-3.712 3.712l-3.712 3.712"
            />
          </svg>
          <span className="text-sm font-medium">{post.sharesCount}</span>
        </button>
      </div>
    </div>
  );
};

