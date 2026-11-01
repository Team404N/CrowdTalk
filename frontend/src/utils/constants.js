// API routes and fallback mock data so every page renders before the backend is running.
export const ROUTES = {
  LOGIN: '/auth/login', SIGNUP: '/auth/signup', VERIFY_OTP: '/auth/verify-otp', RESEND_OTP: '/auth/resend-otp',
  POSTS: '/posts', COMMUNITIES: '/communities', USERS: '/users', NOTIFICATIONS: '/notifications',
  RESOURCES: '/resources', ONBOARDING: '/users/onboarding', SETTINGS: '/users/settings',
};

export const MOCK_USER = {
  id: 'u1', name: 'Abhi Kumar', username: 'abhi', email: 'abhi@example.com', role: 'user',
  bio: 'CS student who loves AI and open source.', avatar: '', stats: { posts: 2, communities: 2, resources: 1 },
};

export const MOCK_USERS = [
  MOCK_USER,
  { id: 'u2', name: 'Priya Sharma', username: 'priya', email: 'priya@example.com', role: 'user', bio: 'Frontend developer.' },
  { id: 'u3', name: 'Ravi Teja', username: 'ravi', email: 'ravi@example.com', role: 'user', bio: 'Placement mentor.' },
];

export const MOCK_COMMUNITIES = [
  { id: 'c1', name: 'React Devs', description: 'Hooks, routing and frontend tips.', members: 1240, isPrivate: false, joined: true, posts: 2, memberList: ['abhi', 'abhi@example.com', 'priya', 'priya@example.com'] },
  { id: 'c2', name: 'Placement Prep', description: 'Interview questions and company experiences.', members: 860, isPrivate: true, joined: false, posts: 1, memberList: ['ravi', 'ravi@example.com'] },
  { id: 'c3', name: 'AI & ML Club', description: 'Papers, projects and study groups.', members: 540, isPrivate: false, joined: true, posts: 0, memberList: ['abhi', 'abhi@example.com'] },
];

export const MOCK_POSTS = [
  { id: 'p1', title: 'When should I use useContext vs props?', body: 'I keep passing the user object through five components. Is context worth it here?', author: 'priya', communityId: 'c1', community: 'React Devs', tags: ['react', 'hooks'], upvotes: 24, comments: 3, createdAt: '2h ago' },
  { id: 'p2', title: 'Best way to structure a MERN project?', body: 'Looking for folder structure advice for a student project.', author: 'abhi', communityId: 'c1', community: 'React Devs', tags: ['mern'], upvotes: 11, comments: 1, createdAt: '5h ago' },
  { id: 'p3', title: 'Top 10 DSA questions for service companies', body: 'Compiled from recent campus drives.', author: 'ravi', communityId: 'c2', community: 'Placement Prep', tags: ['dsa', 'interview'], upvotes: 58, comments: 9, createdAt: '1d ago' },
];

export const MOCK_COMMENTS = [
  { id: 'cm1', author: 'ravi', text: 'Use context once the data is needed by many distant components.', createdAt: '1h ago',
    replies: [{ id: 'cm2', author: 'priya', text: 'That makes sense, thanks!', createdAt: '50m ago', replies: [] }] },
  { id: 'cm3', author: 'abhi', text: 'Also consider a custom hook to wrap the context.', createdAt: '30m ago', replies: [] },
];

export const MOCK_RESOURCES = [
  { id: 'r1', communityId: 'c1', title: 'React Docs: Learn', url: 'https://react.dev/learn', description: 'Official step-by-step tutorial.', category: 'Article', author: 'priya' },
  { id: 'r2', communityId: 'c1', title: 'React Router v6 guide', url: 'https://reactrouter.com', description: 'Routing reference.', category: 'Study Link', author: 'abhi' },
  { id: 'r3', communityId: 'c3', title: 'Neural Networks (video series)', url: 'https://www.youtube.com', description: 'Visual intro to neural nets.', category: 'Media', author: 'abhi' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'discussion', text: 'priya started a discussion in React Devs', time: '10m ago', read: false },
  { id: 'n2', type: 'resource', text: 'New resource shared in AI & ML Club', time: '1h ago', read: false },
  { id: 'n3', type: 'invite', text: 'You were invited to join Placement Prep', time: '1d ago', read: true },
  { id: 'n4', type: 'security', text: 'New sign-in to your account detected', time: '2d ago', read: true },
];

export const INTERESTS = ['Web Dev', 'AI / ML', 'Data Science', 'Cybersecurity', 'Cloud', 'Mobile Apps', 'DSA', 'Open Source', 'Design', 'Career'];
