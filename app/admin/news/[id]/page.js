'use client';

import { use } from 'react';
import NewsForm from '../NewsForm';

export default function EditNewsPage({ params }) {
  const { id } = use(params);
  return <NewsForm newsId={id} />;
}
