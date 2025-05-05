export interface IPost {
    _id?: string,
    userId: string,
    content: string,
    image?: string,
    likes?: string[],
    createdAt?: Date,
    updatedAt?: Date
}