import { seedRow } from 'better-sqlite3-proxy'
import { proxy } from './proxy'

// This file serve like the knex seed file.
//
// You can setup the database with initial config and sample data via the db proxy.

seedRow(proxy.method, { method: 'GET' })
seedRow(proxy.method, { method: 'POST' })
seedRow(proxy.method, { method: 'ws' })

/*Seed User*/
proxy.user[1] = {
  username: 'John Doe',
  password_hash: null,
  email: null,
  tel: null,
  avatar: null,
  is_admin: false,
  nickname: null,
}

proxy.user[1] = {
  username: 'John Doe',
  password_hash: null,
  email: null,
  tel: null,
  avatar: null,
  is_admin: false,
  nickname: null,
}

proxy.user[2] = {
  username: 'Jane Smith',
  password_hash: null,
  email: 'jane.smith@example.com',
  tel: null,
  avatar: 'https://picsum.photos/100',
  is_admin: false,
  nickname: 'JaneS',
}

proxy.user[3] = {
  username: 'Alex Wong',
  password_hash: null,
  email: 'alex.wong@example.com',
  tel: '+1234567890',
  avatar: null,
  is_admin: true,
  nickname: 'AlexW',
}

/* Seed Post*/
proxy.post[1] = {
  user_id: 1,
  tags: `Food`,
  title: `Fruit of the King`,
  content: `This is an apple.`,
  like_count: 10,
  comment_count: 5,
  photo_url: 'https://picsum.photos/200',

  // created_at: '21May2025 11:00',
  // updated_at: '21May2025 11:00',
}

proxy.post[2] = {
  user_id: 2,
  tags: `Travel`,
  title: `Sunset Adventure`,
  content: `Chasing sunsets at the beach! 🌅`,
  like_count: 25,
  comment_count: 8,
  photo_url: 'https://picsum.photos/201',

  // created_at: '22May2025 18:30',
  // updated_at: '22May2025 18:30',
}

proxy.post[3] = {
  user_id: 3,
  tags: `Food`,
  title: `Coffee Break`,
  content: `Nothing beats a morning coffee. ☕ #WorkFromHome`,
  like_count: 15,
  comment_count: 3,
  photo_url: 'https://picsum.photos/202',

  // created_at: '23May2025 09:15',
  // updated_at: '23May2025 09:15',
}

/*Respond Seed*/

proxy.response[1] = {
  user_id: 1,
  content: `Yummy`,
  created_at: Date.now(),
}

proxy.response[2] = {
  user_id: 1,
  content: `Yummy`,
  created_at: Date.now(),
}

proxy.response[3] = {
  user_id: 1,
  content: `Yummy`,
  created_at: Date.now(),
}
