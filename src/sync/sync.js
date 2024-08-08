require('dotenv').config();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const SUPABASE_TABLE_NAME = 'products';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (imageUrl) => {
  try {
    const response = await axios({
      url: imageUrl,
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'your_folder' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url); 
          }
        }
      );

      response.data.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

const syncData = async () => {
  try {
    console.log("Fetching data from Airtable...");

    const response = await axios.get(AIRTABLE_API_URL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    const records = response.data.records;
    console.log("Airtable Response:", records);

    const products = await Promise.all(records.map(async (record) => {
      const imageUrl = record.fields.Image ? await uploadToCloudinary(record.fields.Image[0].url) : '';

      return {
        id: record.id,
        title: record.fields.Title || '',
        image: imageUrl,
        short_description: record.fields['Short Description'] || '',
      };
    }));

    console.log("Upserting data into Supabase...");
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert(products, { onConflict: ['id'] });

    if (error) {
      throw new Error(`Error upserting data into Supabase: ${error.message}`);
    }

    console.log('Data synchronized successfully');
  } catch (error) {
    console.error('Error during synchronization:', error);
  }
};

syncData();
