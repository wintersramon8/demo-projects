export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Feed: undefined;
  Profile: { userId?: string };
  CreatePost: undefined;
  PostDetails: { postId: string };
  Connections: { userId: string; type: 'followers' | 'following' };
};

