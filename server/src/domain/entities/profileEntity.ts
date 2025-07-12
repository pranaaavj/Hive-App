interface SearchUser {
  _id: string;
  username: string;
  profilePicture?: string;
  followers: number;
}

export type SearchUsers = SearchUser[];
