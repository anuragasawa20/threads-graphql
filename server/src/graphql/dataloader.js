import DataLoader from 'dataloader';
import { userRepository } from '../repositories/user.repository.js';
import { postRepository } from '../repositories/post.repository.js';
import { likeRepository } from '../repositories/like.repository.js';

export const userLoader = new DataLoader(async (userIds) => {
    const users = await userRepository.findByIds(userIds);
    return userIds.map((userId) => users.find((user) => String(user.id) === String(userId)) ?? null);
});

export const postLoader = new DataLoader(async (postIds) => {
    const posts = await postRepository.findByIds(postIds);
    return postIds.map((postId) => posts.find((post) => String(post.id) === String(postId)) ?? null);
});

export const likeLoader = new DataLoader(async (likeIds) => {
    const likes = await likeRepository.findByIds(likeIds);
    return likeIds.map((likeId) => likes.find((like) => String(like.id) === String(likeId)) ?? null);
});