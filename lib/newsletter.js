import { supabase } from './supabase';

export async function subscribeNewsletter(email) {
  const { data, error } = await supabase
    .from('newsletter')
    .insert([{ email: email.trim().toLowerCase() }])
    .select();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    return {
      success: false,
      error,
    };
  }

  return {
    success: true,
    data,
  };
}