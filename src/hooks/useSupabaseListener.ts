import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const useSupabaseListener = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        updateAirtable(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
};

const updateAirtable = async (updatedProduct: any) => {
  const { id, title, image, short_description } = updatedProduct;
  try {
    const response = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Title: title,
          Image: [{ url: image }],
          'Short Description': short_description
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update Airtable');
    }
  } catch (error) {
    console.error('Error updating Airtable:', error);
  }
};

export default useSupabaseListener;
