'use client';

import { use } from 'react';
import BlogForm from '../BlogForm';

export default function EditBlogPage({ params }) {
  const { id } = use(params);
  return <BlogForm blogId={id} />;
}
